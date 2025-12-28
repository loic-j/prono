#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create SuperTokens User and Database
    CREATE USER supertokens_user WITH PASSWORD 'somePassword';
    CREATE DATABASE supertokens;
    -- Ensure ownership and schema privileges for SuperTokens
    ALTER DATABASE supertokens OWNER TO supertokens_user;
    \connect supertokens
    ALTER SCHEMA public OWNER TO supertokens_user;
    GRANT ALL ON SCHEMA public TO supertokens_user;
    GRANT ALL PRIVILEGES ON DATABASE supertokens TO supertokens_user;
    \connect :POSTGRES_DB

    -- Create Prono App User and Database
    CREATE USER prono_app WITH PASSWORD 'prono_password';
    CREATE DATABASE prono;
    -- Ensure ownership and schema privileges for app DB
    ALTER DATABASE prono OWNER TO prono_app;
    \connect prono
    ALTER SCHEMA public OWNER TO prono_app;
    GRANT ALL ON SCHEMA public TO prono_app;
    GRANT ALL PRIVILEGES ON DATABASE prono TO prono_app;
    \connect :POSTGRES_DB
EOSQL
