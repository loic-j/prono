#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create SuperTokens User and Database
    CREATE USER supertokens_user WITH PASSWORD 'somePassword';
    CREATE DATABASE supertokens;
    GRANT ALL PRIVILEGES ON DATABASE supertokens TO supertokens_user;

    -- Create Prono App User and Database
    CREATE USER prono_app WITH PASSWORD 'prono_password';
    CREATE DATABASE prono;
    GRANT ALL PRIVILEGES ON DATABASE prono TO prono_app;
EOSQL
