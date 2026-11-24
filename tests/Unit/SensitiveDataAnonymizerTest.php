<?php

namespace Tests\Unit;

use App\Services\SensitiveDataAnonymizer;
use PHPUnit\Framework\TestCase;

class SensitiveDataAnonymizerTest extends TestCase
{
    private function anonymize(string $text): string
    {
        return (new SensitiveDataAnonymizer)->anonymize($text);
    }

    public function test_env_file_secrets_are_masked_and_safe_values_kept(): void
    {
        $env = <<<'ENV'
APP_NAME="Demo App"
APP_ENV=production
APP_KEY=base64:FAKEKEYFAKEKEYFAKEKEYFAKEKEYFAKEKEYFAKEKEY=
DB_HOST=127.0.0.1
DB_USERNAME=demo_user
DB_PASSWORD=Fake-Pass-123!
REDIS_PASSWORD=null
MAIL_PASSWORD="abcd efgh ijkl" # app password
MAIL_FROM_ADDRESS="hello@example.com"
export STRIPE_SECRET=sk_live_FAKEFAKEFAKEFAKEFAKE
AWS_BUCKET=my-bucket
ENV;

        $result = $this->anonymize($env);

        foreach (['FAKEKEYFAKE', 'demo_user', 'Fake-Pass-123', 'abcd efgh', 'hello@example.com', 'sk_live_FAKE'] as $secret) {
            $this->assertStringNotContainsString($secret, $result);
        }
        $this->assertStringContainsString('APP_NAME="Demo App"', $result);
        $this->assertStringContainsString('DB_HOST=127.0.0.1', $result);
        $this->assertStringContainsString('REDIS_PASSWORD=null', $result);
        $this->assertStringContainsString('AWS_BUCKET=my-bucket', $result);
        $this->assertStringContainsString('MAIL_PASSWORD="[REDACTED]" # app password', $result);
        $this->assertStringContainsString('MAIL_FROM_ADDRESS="[EMAIL]"', $result);
    }

    public function test_json_and_yaml_secrets_are_masked(): void
    {
        $result = $this->anonymize("{\"api_key\": \"abc123secret\", \"name\": \"ok\", \"clientSecret\": \"zzz999\"}\npassword: hunter2\nhost: db.internal");

        $this->assertStringNotContainsString('abc123secret', $result);
        $this->assertStringNotContainsString('zzz999', $result);
        $this->assertStringNotContainsString('hunter2', $result);
        $this->assertStringContainsString('"name": "ok"', $result);
        $this->assertStringContainsString('host: db.internal', $result);
    }

    public function test_commands_urls_and_headers_are_masked(): void
    {
        $result = $this->anonymize(
            "mysql -u root --password=Sup3rSecret\n".
            "git clone https://deploy:ghs3cret@github.com/acme/app.git\n".
            "curl -H 'Authorization: Bearer abcdefghijklmnop12345' http://203.0.113.10/api\n".
            'ssh admin@10.20.30.40'
        );

        $this->assertStringNotContainsString('Sup3rSecret', $result);
        $this->assertStringNotContainsString('ghs3cret', $result);
        $this->assertStringNotContainsString('abcdefghijklmnop12345', $result);
        $this->assertStringNotContainsString('203.0.113.10', $result);
        $this->assertStringNotContainsString('admin@10.20.30.40', $result);
        $this->assertStringContainsString('github.com/acme/app.git', $result);
    }

    public function test_tokens_keys_and_private_keys_are_masked_anywhere(): void
    {
        $jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signaturepart';
        $result = $this->anonymize(
            "token seen: {$jwt}\nkey AKIAABCDEFGHIJKLMNOP\n-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAKj\n-----END RSA PRIVATE KEY-----\nnode v1.2.3"
        );

        $this->assertStringNotContainsString('eyJhbGci', $result);
        $this->assertStringNotContainsString('AKIAABCDEFGHIJKLMNOP', $result);
        $this->assertStringNotContainsString('MIIBOgIBAAJBAKj', $result);
        $this->assertStringContainsString('node v1.2.3', $result);
    }

    public function test_plain_terminal_output_is_unchanged(): void
    {
        $text = "$ npm run build\nbuilt in 1.90s\ncommit 3f2a9c1";

        $this->assertSame($text, $this->anonymize($text));
    }
}
