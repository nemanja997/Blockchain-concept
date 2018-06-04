const SHA256=require('crypto-js/sha256');

class Transaction{
    constructor(fromAddress,toAddress,amount){
        this.fromAddress=fromAddress;
        this.toAddress=toAddress;
        this.amount=amount;
    }

}

class Block{
    constructor( timestamp, transaction, previusHash=""){
        this.timestamp = timestamp;
        this.transaction = transaction;
        this.previusHash = previusHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.previusHash + this.timestamp + this.nonce + JSON.stringify(this.transaction)).toString();
        //toString jer SHA256 vraca objekat
    }

    mineBlock(dificulty){
        //proverava da li ima dovoljno nula u hashu, implementacija proof of work sistema
        while(this.hash.substring(0,dificulty) !== Array(dificulty + 1).join("0")){

            //inkrementiramo nonce da bismo u svakoj iteraciji dobijali drugaciji hash
            this.nonce++;
            this.hash=this.calculateHash();
        }

        console.log("Blok je majnovan:"+this.hash);
    }
}

class Blockchain{
    constructor(){
        this.chain=[this.createGenesisBlock()];
        this.dificulty=4;
        this.pendingTransactions=[];
        this.miningReward=100;
    }
    //pravljenje pocetnog bloka
    createGenesisBlock(){
        return new Block("03/06/2018","Genesis block","0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    minePendingTransactions(miningRewardAddress){
        //realno se selektuju transakcije koje ce uci u blok, jer obicno ih ima vise nego sto moze da stane,ali ovde stavljamo sve
        let block=new Block(Date.now(),this.pendingTransactions);
        block.mineBlock(this.dificulty);

        console.log("Blok je uspesno iskopan.");
        this.chain.push(block);

        this.pendingTransactions=[
            new Transaction(null,miningRewardAddress,this.miningReward)
        ];
    }

    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getBalanceAddress(address){
        let balance=0;
        for(const block of this.chain){
            for(const trans of block.transaction){
                //Ako je trazena adresa izvorisna onda se oduzima iznos transakcije
                if(trans.fromAddress === address){
                    balance-=trans.amount;
                }
                //Ako je trazena adresa izvorisna onda se dodaje iznos transakcije
                if(trans.toAddress === address){
                    balance+=trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid(){
        for(let i=1;i<this.chain.length;i++){
            const currentBlock=this.chain[i];
            const previusBlock=this.chain[i-1];
            
            //provera da li je hash svakog bloka validan
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }
            //provera da li validan previusHash svakog bloka
            if(currentBlock.previusHash !== previusBlock.hash){
                return false;
            }
        }
        return true;
    }

}

//TESTIRANJE
let nemanjaCoin=new Blockchain();

const adresa1="LAT4R23Q";
const adresa2="77BBJKGD";
const adresa3="XD8RJNAN";
const adresa4="4CX8VNSC";

nemanjaCoin.createTransaction(new Transaction(adresa1,adresa2,20));
nemanjaCoin.createTransaction(new Transaction(adresa2,adresa3,14));
nemanjaCoin.createTransaction(new Transaction(adresa4,adresa1,31));
nemanjaCoin.createTransaction(new Transaction(adresa2,adresa3,45));

console.log("Zapocinje se kopanje 1...");
nemanjaCoin.minePendingTransactions(adresa2);

nemanjaCoin.createTransaction(new Transaction(adresa4,adresa3,32));
nemanjaCoin.createTransaction(new Transaction(adresa3,adresa2,76));
nemanjaCoin.createTransaction(new Transaction(adresa4,adresa1,45));
nemanjaCoin.createTransaction(new Transaction(adresa1,adresa4,49));
nemanjaCoin.createTransaction(new Transaction(adresa1,adresa3,23));
nemanjaCoin.createTransaction(new Transaction(adresa2,adresa2,78));

console.log("Stanje adrese 1 je: ",nemanjaCoin.getBalanceAddress(adresa1));
console.log("Stanje adrese 2 je: ",nemanjaCoin.getBalanceAddress(adresa2));
console.log("Da li je lanac validan: " + nemanjaCoin.isChainValid()?"jeste":"nije");

console.log("Zapocinje se kopanje 2...");
nemanjaCoin.minePendingTransactions(adresa1);

console.log("Stanje adrese 1 je: ",nemanjaCoin.getBalanceAddress(adresa1));
console.log("Stanje adrese 2 je: ",nemanjaCoin.getBalanceAddress(adresa2));

console.log("Zapocinje se kopanje 3...");
nemanjaCoin.minePendingTransactions(adresa3);
nemanjaCoin.createTransaction(new Transaction(adresa1,adresa4,49));

console.log("Stanje adrese 1 je: ",nemanjaCoin.getBalanceAddress(adresa1));
console.log("Stanje adrese 2 je: ",nemanjaCoin.getBalanceAddress(adresa2));


