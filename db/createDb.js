import pg from 'pg';
import dotenv from 'dotenv';
import { upload } from 'pg-upload';

dotenv.config();
console.log('Connecting to database', process.env.PG_DATABASE);
const db = new pg.Pool({
    host:     process.env.PG_HOST,
    port:     parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl:      { rejectUnauthorized: false },
});
const dbResult = await db.query('select now()');
console.log('Database connection established on', dbResult.rows[0].now);

console.log('Dropping table if they already exist....')
//-- Slet eksisterende tabeller, hvis de findes
await db.query(`
        
        drop table if exists block cascade;
        drop table if exists transaction cascade;
        drop table if exists transfer;
        drop table if exists address;
        drop table if exists exchangeRate;
        drop table if exists cryptoCurrency;
        
    `)

    //-- Opret block-tabel
await db.query(`
create table block(
    hash varchar(256) primary key,
    height integer not null,
    timestamp timestamp not null,
    previous_hash varchar(256)
)
`)
console.log('Created block table')

//-- Opret transaction-tabel

await db.query(`
    create table transaction(
        hash varchar(256) primary key,
        block_hash varchar(256) references block

)
`)

console.log('Created transaction table')

//-- Opret address-tabel
await db.query(`
    create table address(
        address varchar(256) primary key
)
`)
console.log('Created address table')

//-- Opret cryptoCurrency-tabel
await db.query(`
    create table cryptoCurrency(
        symbol varchar(256) primary key,
        name varchar(256) not null
)
`)
console.log('Created cryptoCurrency table')

//-- Opret transfer-tabel
await db.query(`
    create table transfer(
    transfer_id integer primary key,
    tx_hash varchar(256) references transaction,
    sender varchar(256) references address,
    receiver varchar(256) references address,
    currency varchar(256) references cryptoCurrency,
    amount numeric not null
)
`)

console.log('Created transfer table')



//-- Opret exchangeRate-tabel
await db.query(`
    create table exchangeRate(
        currency varchar(256) references cryptoCurrency,
        value numeric not null,
        timestamp timestamp not null,
        primary key(currency, timestamp)
)
`)
console.log('Created exchangeRate table')








// Indsæt data i Blockchain
console.log('Inserting data in blockchain...');
await upload(
    db,
    'db/block.csv',
    'copy block (hash, height, timestamp, previous_hash) from stdin with csv header'
);

console.log('Data inserted.');

// Indsæt data i Transaction
console.log('Inserting data in transaction...');
await upload(
    db,
    'db/transaction.csv',
    'copy transaction (hash, block_hash) from stdin with csv header'
);
console.log('Data inserted.');

// Indsæt data i Address
console.log('Inserting data in address...');
await upload(
    db,
    'db/address.csv',
    'copy address (address) from stdin with csv header'
);
console.log('Data inserted.');

// Indsæt data i CryptoCurrency
console.log('Inserting data in cryptoCurrency...');
await upload(
    db,
    'db/cryptoCurrency.csv',
    'copy cryptoCurrency (symbol, name) from stdin with csv header'
);
console.log('Data inserted.');

// Indsæt data i Transfer
console.log('Inserting data in transfer...');
await upload(
    db,
    'db/transfer.csv',
    'copy transfer (transfer_id, tx_hash, sender, receiver, currency, amount) from stdin with csv header'
);
console.log('Data inserted.');

// Indsæt data i ExchangeRate
console.log('Inserting data in exchangeRate...');
await upload(
    db,
    'db/exchange_rate.csv',
    'copy exchangeRate (currency, value, timestamp) from stdin with csv header'
);
console.log('Data inserted.');

console.log('Database created and data inserted.');





await db.end();