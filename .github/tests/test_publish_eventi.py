import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('publisher', Path(__file__).parents[1] / 'publish_eventi.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)


class PublisherTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.source = self.root / 'source'
        self.repo = self.root / 'repo'
        self.source.mkdir()
        (self.repo / 'eventi/assets').mkdir(parents=True)
        (self.repo / 'varie').mkdir()
        (self.repo / 'varie/index.html').write_text('untouched')
        (self.source / 'assets').mkdir()
        self.page = dict(title='Eventi', slug='eventi', category='eventi', description='Eventi pubblici',
                         createdAt='2026-09-03', updatedAt='2026-10-09', listed=True,
                         coverImage='assets/cover.jpg', tags=['eventi'], eventCount=9,
                         eventsGeneratedAt='2026-10-09T09:00:00+00:00')
        self.save_page()
        (self.source / 'index.html').write_text(p.BASE + '/eventi/ noindex')
        for name in ('style.css', 'script.js', 'cover.jpg'):
            (self.source / 'assets' / name).write_text('data')
        (self.repo / 'eventi/page.json').write_text(json.dumps(self.page))
        self.catalog = {'updatedAt':'2026-10-01','custom':'preserved','pages':[
            {'slug':'varie','title':'Unchanged','unknown':42},
            {'slug':'eventi','title':'Old','createdAt':'2026-09-01','custom':'preserved'},
            {'slug':'cucina','title':'Also unchanged'}]}
        (self.repo / 'catalogo.json').write_text(json.dumps(self.catalog))
        self.publication = dict(sourceSha='a'*40, sourceRunId=1, sourceRunAttempt=1, sourceRunNumber=1)

    def save_page(self):
        (self.source / 'page.json').write_text(json.dumps(self.page))

    def test_only_eventi_and_one_catalog_entry_change(self):
        (self.repo / 'eventi/assets/expired.txt').write_text('obsolete')
        p.sync_package(self.source, self.repo, self.publication)
        catalog = json.loads((self.repo / 'catalogo.json').read_text())
        self.assertEqual(catalog['pages'][0], self.catalog['pages'][0])
        self.assertEqual(catalog['pages'][2], self.catalog['pages'][2])
        self.assertEqual(catalog['custom'], 'preserved')
        self.assertEqual(catalog['updatedAt'], '2026-10-01')
        self.assertEqual(catalog['pages'][1]['createdAt'], '2026-09-01')
        self.assertEqual(catalog['pages'][1]['custom'], 'preserved')
        self.assertEqual((self.repo / 'varie/index.html').read_text(), 'untouched')
        self.assertFalse((self.repo / 'eventi/assets/expired.txt').exists())

    def test_idempotent_sync(self):
        p.sync_package(self.source, self.repo, self.publication)
        before = {str(f):f.read_bytes() for f in self.repo.rglob('*') if f.is_file()}
        p.sync_package(self.source, self.repo, self.publication)
        self.assertEqual(before, {str(f):f.read_bytes() for f in self.repo.rglob('*') if f.is_file()})

    def test_wrong_slug_rejected_before_writes(self):
        self.page['slug'] = '../medicina'
        self.save_page()
        with self.assertRaises(ValueError): p.sync_package(self.source,self.repo,self.publication)
        self.assertFalse((self.repo / 'eventi/index.html').exists())

    def test_wrong_category(self):
        self.page['category'] = 'varie'; self.save_page()
        with self.assertRaises(ValueError): p.validate_package(self.source)

    def test_hidden_secret(self):
        (self.source / 'assets/.env').write_text('dummy')
        with self.assertRaises(ValueError): p.validate_package(self.source)

    def test_executable_source_rejected(self):
        (self.source / 'assets/run.py').write_text('pass')
        with self.assertRaises(ValueError): p.validate_package(self.source)

    def test_root_extra_rejected(self):
        (self.source / 'README.txt').write_text('extra')
        with self.assertRaises(ValueError): p.validate_package(self.source)

    def test_cover_escape_rejected(self):
        self.page['coverImage'] = '../cover.jpg'; self.save_page()
        with self.assertRaises(ValueError): p.validate_package(self.source)

    def test_missing_required_file(self):
        (self.source / 'assets/style.css').unlink()
        with self.assertRaises(ValueError): p.validate_package(self.source)

    def test_duplicate_catalog_rejected(self):
        self.catalog['pages'].append(dict(slug='eventi'))
        with self.assertRaises(ValueError): p.updated_catalog(self.catalog, self.page)

    def test_older_collection_rejected(self):
        self.page['eventsGeneratedAt'] = '2026-10-08T09:00:00+00:00'; self.save_page()
        with self.assertRaises(ValueError): p.sync_package(self.source,self.repo,self.publication)

    def test_scope_guard(self):
        self.assertTrue(p.allowed_changes(['eventi/index.html','catalogo.json']))
        for path in ['index.html','assets/app-shell.js','varie/index.html','.github/x','eventi-other/x','eventi/../index.html']:
            self.assertFalse(p.allowed_changes([path]))

    def test_receipt_cannot_come_from_source(self):
        (self.source / p.RECEIPT).write_text('{}')
        with self.assertRaises(ValueError): p.validate_package(self.source)

    def test_no_successful_run(self):
        run = self.source_run()
        run['conclusion'] = 'failure'
        with patch.object(p,'api',side_effect=[{'full_name':p.SOURCE}, run]):
            with self.assertRaises(ValueError): p.candidate(123, 2)

    def test_unexpected_workflow_rejected(self):
        run = self.source_run()
        run['path'] = 'evil.yml'
        with patch.object(p,'api',side_effect=[{'full_name':p.SOURCE}, run]):
            with self.assertRaises(ValueError): p.candidate(123, 2)

    def source_run(self):
        return dict(id=123, run_attempt=2, run_number=9, path=p.WORKFLOW,
                    head_branch='main', head_sha='b'*40, status='completed',
                    conclusion='success', event='schedule',
                    repository={'full_name':p.SOURCE}, head_repository={'full_name':p.SOURCE})

    def test_exact_run_attempt_and_tag(self):
        responses = [{'full_name':p.SOURCE}, self.source_run(),
                     {'object':{'type':'commit','sha':'a'*40}},
                     {'status':'ahead'}, {'status':'identical'}]
        with patch.object(p, 'api', side_effect=responses) as api:
            result = p.candidate(123, 2)
        self.assertEqual(result, dict(sourceSha='a'*40, sourceRunId=123, sourceRunAttempt=2, sourceRunNumber=9))
        self.assertEqual(api.call_args_list[1].args[0], '/repos/giufog/eventi/actions/runs/123/attempts/2')
        self.assertEqual(api.call_args_list[2].args[0], '/repos/giufog/eventi/git/ref/tags/giu-page-ready-123-2')

    def test_invalid_source_identity_rejected(self):
        for field, value in [('id',124), ('run_attempt',1), ('status','in_progress'),
                             ('head_branch','other'), ('event','pull_request'),
                             ('repository',{'full_name':'other/repo'}),
                             ('head_repository',{'full_name':'fork/eventi'})]:
            run = self.source_run()
            run[field] = value
            with self.subTest(field=field), patch.object(p,'api',side_effect=[{'full_name':p.SOURCE},run]):
                with self.assertRaises(ValueError): p.candidate(123,2)

    def test_invalid_ids_do_not_call_network(self):
        for value in ('latest', '0', '-1', '1/2', '1.0', ''):
            with self.subTest(value=value), patch.object(p,'api') as api:
                with self.assertRaises(ValueError): p.candidate(value,1)
                api.assert_not_called()

    def test_missing_tag_is_failure(self):
        error = p.urllib.error.HTTPError('https://example.invalid',404,'missing',{},None)
        with patch.object(p,'api',side_effect=[{'full_name':p.SOURCE},self.source_run(),error]):
            with self.assertRaisesRegex(ValueError,'Required source tag'): p.candidate(123,2)

    def test_success_has_no_wait(self):
        with patch.object(p.time,'sleep') as sleep:
            self.assertEqual(p.publish_with_retries(lambda: 'done'), 'done')
            sleep.assert_not_called()

    def test_transient_error_retries_and_stops_at_success(self):
        from unittest.mock import Mock
        operation = Mock(side_effect=[TimeoutError(), 'done'])
        sleep = Mock()
        self.assertEqual(p.publish_with_retries(operation, sleep), 'done')
        self.assertEqual(operation.call_count, 2)
        sleep.assert_called_once_with(900)

    def test_three_total_attempts_two_waits_then_failure(self):
        from unittest.mock import Mock, call
        operation = Mock(side_effect=TimeoutError('temporary'))
        sleep = Mock()
        with self.assertRaises(TimeoutError): p.publish_with_retries(operation, sleep)
        self.assertEqual(operation.call_count, 3)
        self.assertEqual(sleep.call_args_list, [call(900),call(900)])

    def test_non_retryable_errors_do_not_wait(self):
        from unittest.mock import Mock
        for error in (ValueError('unsafe'), PermissionError(),
                      p.subprocess.CalledProcessError(1,['git','push']),
                      p.urllib.error.HTTPError('https://example.invalid',403,'forbidden',{},None),
                      p.urllib.error.URLError('certificate verification failed')):
            operation, sleep = Mock(side_effect=error), Mock()
            with self.subTest(error=type(error).__name__), self.assertRaises(type(error)):
                p.publish_with_retries(operation,sleep)
            self.assertEqual(operation.call_count,1)
            sleep.assert_not_called()

    def test_transient_http_statuses(self):
        for status in (408,429,500,502,503,504):
            self.assertTrue(p.retryable(p.urllib.error.HTTPError('https://example.invalid',status,'temporary',{},None)))
        for status in (400,401,403,404,409,422):
            self.assertFalse(p.retryable(p.urllib.error.HTTPError('https://example.invalid',status,'permanent',{},None)))

    def test_workflow_only_dispatch_and_bounded_timeout(self):
        workflow = (Path(__file__).parents[1] / 'workflows/publish-eventi.yml').read_text()
        self.assertNotIn('schedule:',workflow)
        self.assertNotIn('bootstrap',workflow)
        for text in ('workflow_dispatch:', 'source_run_id:', 'source_run_attempt:', 'timeout-minutes: 95'):
            self.assertIn(text,workflow)

    def test_publication_retry_keeps_exact_commit(self):
        from unittest.mock import call
        sha = 'c'*40
        with patch.object(p,'git',return_value=sha) as git, \
                patch.object(p,'verify_online',side_effect=[TimeoutError(),None]) as verify, \
                patch.object(p.time,'sleep') as sleep:
            p.publish_commit(self.repo,self.page,sha)
        self.assertEqual(verify.call_args_list,[call(self.repo,self.page,sha)]*2)
        pushes = [item for item in git.call_args_list if item.args[1] == 'push']
        self.assertEqual(pushes,[call(self.repo,'push','origin',sha+':refs/heads/main')]*2)
        sleep.assert_called_once_with(900)

    def test_changed_commit_stops_before_second_push(self):
        sha = 'c'*40
        with patch.object(p,'git',side_effect=[sha,'','d'*40]) as git, \
                patch.object(p,'verify_online',side_effect=TimeoutError()), \
                patch.object(p.time,'sleep') as sleep:
            with self.assertRaisesRegex(ValueError,'commit changed'):
                p.publish_commit(self.repo,self.page,sha)
        self.assertEqual(len([item for item in git.call_args_list if item.args[1] == 'push']),1)
        sleep.assert_called_once_with(900)

    def test_other_commit_failed_build_does_not_fail_this_build(self):
        sha = 'c'*40
        responses = [{}, [{'commit':'d'*40,'status':'errored'},{'commit':sha,'status':'built'}]]
        with patch.object(p,'api',side_effect=responses) as api, \
                patch.object(p,'time') as time:
            time.monotonic.return_value = 0
            # Stop after build identification, before fixture-missing asset checks.
            with self.assertRaises(FileNotFoundError): p.verify_online(self.repo,self.page,sha)
        self.assertIn('pages/builds?per_page=100',api.call_args.args[0])
        time.sleep.assert_not_called()

    def test_symlink_rejected(self):
        try: (self.source / 'assets/link.txt').symlink_to(self.repo / 'varie/index.html')
        except OSError: self.skipTest('Symlink permission unavailable locally')
        with self.assertRaises(ValueError): p.validate_package(self.source)

    def test_missing_private_source_token_fails_before_network(self):
        with patch.dict(p.os.environ, {}, clear=True), patch.object(p.urllib.request, 'build_opener') as opener:
            with self.assertRaisesRegex(ValueError, 'EVENTI_READ_TOKEN'): p.candidate(123,2)
            opener.assert_not_called()

    def test_source_api_uses_only_read_token(self):
        with patch.dict(p.os.environ, {'EVENTI_READ_TOKEN':'dummy-read','GH_TOKEN':'dummy-write'}):
            with patch.object(p.urllib.request, 'build_opener') as opener:
                opener.return_value.open.return_value = io.BytesIO(b'{"ok":true}')
                self.assertTrue(p.api('/repos/' + p.SOURCE)['ok'])
                request = opener.return_value.open.call_args.args[0]
                self.assertEqual(request.get_header('Authorization'), 'Bearer dummy-read')

    def test_destination_api_uses_only_central_token(self):
        with patch.dict(p.os.environ, {'EVENTI_READ_TOKEN':'dummy-read','GH_TOKEN':'dummy-write'}):
            with patch.object(p.urllib.request, 'build_opener') as opener:
                opener.return_value.open.return_value = io.BytesIO(b'{}')
                p.api('/repos/' + p.DESTINATION + '/pages/builds', authenticated=True, method='POST')
                request = opener.return_value.open.call_args.args[0]
                self.assertEqual(request.get_header('Authorization'), 'Bearer dummy-write')

    def test_tokens_cannot_be_used_for_other_repositories_or_source_writes(self):
        for path, authenticated, method in [('/repos/other/repo',False,'GET'),
                                           ('/repos/'+p.SOURCE,False,'POST'),
                                           ('/repos/'+p.SOURCE+'/contents',True,'GET')]:
            with self.assertRaises(ValueError): p.api(path, authenticated=authenticated, method=method)

    def test_git_read_credentials_are_scoped_and_not_persisted(self):
        with patch.dict(p.os.environ, {'EVENTI_READ_TOKEN':'dummy-read','GH_TOKEN':'dummy-write','GIT_TRACE_CURL':'1'}):
            env = p.source_git_environment()
        self.assertNotIn('GH_TOKEN',env)
        self.assertNotIn('EVENTI_READ_TOKEN',env)
        self.assertNotIn('GIT_TRACE_CURL',env)
        self.assertEqual(env['GIT_CONFIG_KEY_2'],'http.https://github.com/giufog/eventi.git.extraheader')
        self.assertEqual(env['GIT_CONFIG_VALUE_2'],'AUTHORIZATION: basic ' + p.base64.b64encode(b'x-access-token:dummy-read').decode())
        self.assertEqual(env['GIT_TERMINAL_PROMPT'],'0')
        self.assertEqual(env['GIT_CONFIG_VALUE_3'],'false')

    def test_authenticated_redirect_refused(self):
        with self.assertRaises(ValueError):
            p.NoRedirects().redirect_request(None,None,302,'',{},'https://other.invalid/')

    def test_candidate_requires_source_repository_access(self):
        with patch.object(p,'api',side_effect=PermissionError('no source read permission')):
            with self.assertRaises(PermissionError): p.candidate(123,2)


if __name__ == '__main__':
    unittest.main()
