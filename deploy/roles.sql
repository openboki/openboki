-- イメージが作るロールにはパスワードが無い。GoTrue、PostgREST、マイグレーションが使う3つにだけ付ける。
-- あわせてUmamiのロールとデータベースを作る
\set pgpass `echo "$POSTGRES_PASSWORD"`

alter user postgres with password :'pgpass';
alter user authenticator with password :'pgpass';
alter user supabase_auth_admin with password :'pgpass';

create user umami with password :'pgpass';
create database umami owner umami;
