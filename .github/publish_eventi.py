"""Central cloud publisher: fixed Eventi source, fixed destination, no source code execution."""
import argparse
import base64
import copy
import datetime as dt
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.request

SOURCE = 'giufog/eventi'
DESTINATION = 'giufog/giu-page'
BASE = 'https://giufog.github.io/giu-page'
WORKFLOW = '.github/workflows/update-events.yml'
RECEIPT = 'assets/publication.json'
ALLOWED_ROOT = {'index.html', 'page.json', 'assets', 'dettaglio'}
EXTENSIONS = {'.html', '.json', '.js', '.css', '.svg', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.pdf', '.txt'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def git(root, *args, env=None):
    return subprocess.check_output(['git', '-C', str(root), *args], text=True, encoding='utf-8', env=env, timeout=180).rstrip('\r\n')


def retryable(error):
    if isinstance(error, urllib.error.HTTPError):
        return error.code in (408, 429, 500, 502, 503, 504)
    if isinstance(error, urllib.error.URLError):
        # TLS/certificate/configuration failures are not transient network errors.
        return isinstance(error.reason, (TimeoutError, ConnectionError))
    return isinstance(error, (TimeoutError, ConnectionError, subprocess.TimeoutExpired))


def publish_with_retries(operation, sleep=None):
    sleep = time.sleep if sleep is None else sleep
    for attempt in range(1, 4):
        try:
            return operation()
        except Exception as error:
            if attempt == 3 or not retryable(error):
                raise
            print(f'Errore temporaneo ({type(error).__name__}); tentativo {attempt + 1}/3 tra 900 secondi', flush=True)
            sleep(900)


def source_token():
    token = os.environ.get('EVENTI_READ_TOKEN', '').strip()
    require(bool(token), 'Missing EVENTI_READ_TOKEN: private Eventi requires dedicated contents/actions read access')
    return token


def source_git_environment():
    # Secret only in this child's environment; never in URLs, argv or .git/config.
    auth = base64.b64encode(('x-access-token:' + source_token()).encode()).decode()
    env = {key: value for key, value in os.environ.items()
           if key not in {'GH_TOKEN', 'EVENTI_READ_TOKEN', 'GIT_CURL_VERBOSE'}
           and not key.startswith(('GIT_CONFIG_', 'GIT_TRACE'))}
    settings = [('credential.helper', ''), ('http.extraheader', ''),
                ('http.https://github.com/' + SOURCE + '.git.extraheader', 'AUTHORIZATION: basic ' + auth),
                ('http.followRedirects', 'false')]
    env['GIT_CONFIG_COUNT'] = str(len(settings))
    env['GIT_TERMINAL_PROMPT'] = '0'
    for index, (key, value) in enumerate(settings):
        env[f'GIT_CONFIG_KEY_{index}'] = key
        env[f'GIT_CONFIG_VALUE_{index}'] = value
    return env


class NoRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, newurl):
        raise ValueError('Authenticated GitHub API redirect refused')


def api(path, authenticated=False, method='GET'):
    headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'giu-page-eventi-publisher', 'X-GitHub-Api-Version': '2022-11-28'}
    if authenticated:
        require(path.startswith('/repos/' + DESTINATION + '/'), 'Token restricted to destination API')
        headers['Authorization'] = 'Bearer ' + os.environ['GH_TOKEN']
    else:
        require(path == '/repos/' + SOURCE or path.startswith('/repos/' + SOURCE + '/'), 'Read token restricted to Eventi API')
        require(method == 'GET', 'Source credential is read-only')
        headers['Authorization'] = 'Bearer ' + source_token()
    request = urllib.request.Request('https://api.github.com' + path, headers=headers, method=method)
    with urllib.request.build_opener(NoRedirects()).open(request, timeout=45) as response:
        return json.load(response)


def positive_id(value):
    require(re.fullmatch(r'[1-9][0-9]{0,19}', str(value)) is not None, 'Expected a positive decimal run ID/attempt')
    return int(value)


def candidate(run_id, attempt):
    run_id, attempt = positive_id(run_id), positive_id(attempt)
    repo = api('/repos/' + SOURCE)
    require(repo['full_name'].lower() == SOURCE, 'Wrong source repository')
    run = api(f'/repos/{SOURCE}/actions/runs/{run_id}/attempts/{attempt}')
    require(run['id'] == run_id and run['run_attempt'] == attempt, 'Source run/attempt mismatch')
    require(run['path'] == WORKFLOW and run['head_branch'] == 'main', 'Wrong source workflow')
    require(run['status'] == 'completed' and run['conclusion'] == 'success', 'Source attempt not successfully completed')
    require(run['repository']['full_name'].lower() == SOURCE and run['head_repository']['full_name'].lower() == SOURCE, 'Foreign source repository')
    require(run['event'] in ('schedule', 'workflow_dispatch', 'repository_dispatch'), 'Unexpected source trigger')
    tag = f"giu-page-ready-{run['id']}-{run['run_attempt']}"
    try:
        ref = api(f'/repos/{SOURCE}/git/ref/tags/{tag}')
    except urllib.error.HTTPError as error:
        if error.code == 404:
            raise ValueError('Required source tag unavailable: ' + tag) from error
        raise
    require(ref['object']['type'] == 'commit', 'Readiness tag must be lightweight')
    sha = ref['object']['sha']
    require(re.fullmatch('[0-9a-f]{40}', sha), 'Invalid source SHA')
    compare = api(f"/repos/{SOURCE}/compare/{run['head_sha']}...{sha}")
    require(compare['status'] in ('ahead', 'identical'), 'Package must descend from the successful run input')
    main = api(f'/repos/{SOURCE}/compare/{sha}...main')
    require(main['status'] in ('ahead', 'identical'), 'Package must belong to source main')
    return {'sourceSha': sha, 'sourceRunId': run['id'], 'sourceRunAttempt': run['run_attempt'], 'sourceRunNumber': run['run_number']}


def inventory(root):
    require(root.is_dir() and not root.is_symlink(), 'Package/destination must be a real directory')
    result = {}
    for item in root.rglob('*'):
        require(not item.is_symlink(), 'Symlink forbidden: ' + str(item))
        if item.is_file():
            relative = item.relative_to(root).as_posix()
            require(not any(part.startswith('.') for part in PurePosixPath(relative).parts), 'Hidden path forbidden')
            result[relative] = item
    return result


def validate_package(source):
    files = inventory(source)
    require(set(p.name for p in source.iterdir()) <= ALLOWED_ROOT, 'Unexpected package root item')
    require({'index.html', 'page.json', 'assets/style.css', 'assets/script.js'} <= files.keys(), 'Required files missing')
    require(RECEIPT not in files, 'Publication receipt belongs to central publisher')
    for name, path in files.items():
        require(path.suffix.lower() in EXTENSIONS, 'Non-static file: ' + name)
        require(path.name.lower() not in {'cookies', 'history', 'preferences', 'login data', 'local state'}, 'Profile file forbidden')
        require(path.stat().st_size <= 20 * 1024 * 1024, 'Oversized file: ' + name)
    page = json.loads(files['page.json'].read_text(encoding='utf-8-sig'))
    require(page.get('slug') == 'eventi' and page.get('category') == 'eventi', 'Only Eventi is allowed')
    require(page.get('listed') is True, 'Eventi must stay listed')
    for field in ('title', 'description', 'createdAt', 'updatedAt'):
        require(isinstance(page.get(field), str) and page[field].strip(), 'Missing ' + field)
    for field in ('createdAt', 'updatedAt'):
        dt.date.fromisoformat(page[field])
    cover = page.get('coverImage', '')
    require(cover.startswith('assets/') and cover in files, 'Invalid/missing cover')
    require(isinstance(page.get('tags'), list) and all(isinstance(t, str) for t in page['tags']), 'Invalid tags')
    require(isinstance(page.get('eventCount'), int) and page['eventCount'] >= 8, 'Suspicious empty event collection')
    html = files['index.html'].read_text(encoding='utf-8')
    require(BASE + '/eventi/' in html and 'noindex' in html, 'Canonical/privacy missing')
    return page, files


def updated_catalog(catalog, page):
    result = copy.deepcopy(catalog)
    indexes = [i for i, entry in enumerate(result['pages']) if entry.get('slug') == 'eventi']
    require(len(indexes) == 1, 'Expected exactly one existing Eventi catalog entry')
    old = result['pages'][indexes[0]]
    entry = dict(old)
    for field in ('title', 'description', 'updatedAt', 'tags', 'listed'):
        entry[field] = page[field]
    entry.update(slug='eventi', category='eventi', createdAt=old.get('createdAt') or page['createdAt'],
                 url=BASE + '/eventi/', coverImageUrl=BASE + '/eventi/' + page['coverImage'])
    result['pages'][indexes[0]] = entry
    # Preserve every other entry, order and top-level metadata; this is a one-entry update.
    return result


def sync_package(source, repository, publication):
    repository = repository.resolve()
    target = repository / 'eventi'
    require(target.resolve() == target and target.parent == repository, 'Unsafe target')
    page, files = validate_package(source)
    existing = inventory(target)
    catalog_path = repository / 'catalogo.json'
    require(not catalog_path.is_symlink(), 'Catalog symlink forbidden')
    catalog = json.loads(catalog_path.read_text(encoding='utf-8-sig'))
    result = updated_catalog(catalog, page)
    old_page = json.loads((target / 'page.json').read_text(encoding='utf-8-sig'))
    require(page.get('eventsGeneratedAt', '') >= old_page.get('eventsGeneratedAt', ''), 'Refusing older event collection')
    for name, path in existing.items():
        if name not in files and name != RECEIPT:
            path.unlink()  # Only inventoried regular files strictly inside /eventi.
    for name, path in files.items():
        destination = target / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, destination)
    if result != catalog:
        catalog_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    receipt = {'schemaVersion': 1, 'sourceRepository': SOURCE, **publication,
               'packageSha256': hashlib.sha256(files['index.html'].read_bytes()).hexdigest()}
    (target / RECEIPT).write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
    return page


def allowed_changes(paths):
    return all('..' not in PurePosixPath(path).parts and (path == 'catalogo.json' or path.startswith('eventi/')) for path in paths)


def verify_online(repository, page, sha):
    deadline = time.monotonic() + 900

    def check_deadline():
        if time.monotonic() >= deadline:
            raise TimeoutError('Online verification exceeded 15 minutes')

    # GITHUB_TOKEN pushes do not automatically trigger Pages: explicitly request a build.
    api(f'/repos/{DESTINATION}/pages/builds', authenticated=True, method='POST')
    for attempt in range(40):
        check_deadline()
        builds = api(f'/repos/{DESTINATION}/pages/builds?per_page=100', authenticated=True)
        build = next((item for item in builds if item.get('commit') == sha), {})
        if build.get('status') == 'errored':
            raise ValueError('Pages build failed')
        if build.get('status') == 'built' and build.get('commit') == sha:
            break
        time.sleep(15)
    else:
        raise TimeoutError('Pages build not verified within 10 minutes')
    check_paths = ['eventi/index.html', 'eventi/page.json', 'eventi/assets/style.css', 'eventi/assets/script.js',
                   'eventi/' + page['coverImage'], 'eventi/' + RECEIPT, 'catalogo.json']
    detail = next((repository / 'eventi/dettaglio').glob('*/index.html'), None)
    if detail:
        check_paths.append(detail.relative_to(repository).as_posix())
    for relative in check_paths:
        expected = (repository / relative).read_bytes().replace(b'\r\n', b'\n')
        for retry in range(6):
            check_deadline()
            with urllib.request.urlopen(BASE + '/' + relative + '?cloud=' + sha, timeout=45) as response:
                actual = response.read().replace(b'\r\n', b'\n')
            if actual == expected:
                break
            time.sleep(10)
        else:
            raise TimeoutError('Public asset not yet aligned: ' + relative)
    check_deadline()
    with urllib.request.urlopen(BASE + '/', timeout=45) as response:
        require(response.status == 200, 'Home unavailable')
    print('PUBBLICAZIONE_COMPLETATA ' + BASE + '/eventi/ ' + sha)


def publish_commit(repository, page, sha):
    def publish_frozen_commit():
        require(git(repository, 'rev-parse', 'HEAD') == sha, 'Destination commit changed during retry')
        # Re-pushing the same SHA is idempotent after a push with an uncertain response.
        # No force/rebase/reset; rejected pushes and permission errors stop immediately.
        git(repository, 'push', 'origin', sha + ':refs/heads/main')
        verify_online(repository, page, sha)

    publish_with_retries(publish_frozen_commit)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-run-id', required=True, type=positive_id)
    parser.add_argument('--source-run-attempt', required=True, type=positive_id)
    args = parser.parse_args()
    require(os.environ.get('GITHUB_REPOSITORY') == DESTINATION and os.environ.get('GITHUB_REF') == 'refs/heads/main', 'Only central main Actions may publish')
    repository = Path.cwd().resolve()
    require(not git(repository, 'status', '--porcelain'), 'Dirty destination checkout')
    publication = candidate(args.source_run_id, args.source_run_attempt)
    receipt_file = repository / 'eventi' / RECEIPT
    if receipt_file.exists():
        previous = json.loads(receipt_file.read_text(encoding='utf-8'))
        if (publication['sourceRunNumber'], publication['sourceRunAttempt']) < (previous['sourceRunNumber'], previous['sourceRunAttempt']):
            raise ValueError('Source run superseded by an already published run')
    with tempfile.TemporaryDirectory(prefix='giu-eventi-') as temporary:
        source = Path(temporary)
        source_env = source_git_environment()
        git(source, 'init', '-q')
        git(source, 'remote', 'add', 'origin', 'https://github.com/' + SOURCE + '.git')
        git(source, '-c', 'protocol.file.allow=never', 'fetch', '--depth=1', '--filter=blob:none', 'origin', publication['sourceSha'], env=source_env)
        git(source, 'sparse-checkout', 'set', '--no-cone', '/site/eventi/', env=source_env)
        git(source, 'checkout', '--detach', 'FETCH_HEAD', env=source_env)
        page = sync_package(source / 'site/eventi', repository, publication)
    changed = git(repository, 'status', '--porcelain', '--untracked-files=all').splitlines()
    require(allowed_changes([line[3:] for line in changed]), 'Change outside Eventi/catalog detected')
    git(repository, 'add', '--', 'eventi', 'catalogo.json')
    if git(repository, 'diff', '--cached', '--name-only'):
        git(repository, 'config', 'user.name', 'github-actions[bot]')
        git(repository, 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
        git(repository, 'commit', '-m', 'Pubblica Eventi cloud ' + publication['sourceSha'][:12])
    sha = git(repository, 'rev-parse', 'HEAD')

    publish_commit(repository, page, sha)
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a', encoding='utf-8') as output:
            output.write(f"\nEventi pubblicato e verificato: {BASE}/eventi/\n\nSource `{publication['sourceSha']}` → Giu Page `{sha}`.\n")


if __name__ == '__main__':
    main()
