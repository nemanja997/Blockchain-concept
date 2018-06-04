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
        return SHA256(this.index + this.previusHash + this.timestamp + this.nonce + JSON.stringify(this.data)).toString();
        //toString jer SHA256 vraca objekat
    }

    mineBlock(dificulty){
        while(this.hash.substring(0,dificulty) !== Array(dificulty + 1).join("0")){
            this.nonce++;
            this.hash=this.calculateHash();
        }

        console.log("Blok je majnovan:"+this.hash);
    }
}

class Blockchain{
    constructor(){
        this.chain=[this.createGenesisBlock()];
        this.dificulty=2;
        this.pendingTransactions=[];
        this.miningReward=100;
    }

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

let nemanjaCoin=new Blockchain();

nemanjaCoin.createTransaction(new Transaction("adresa1","adresa2",20));
nemanjaCoin.createTransaction(new Transaction("adresa2","adresa3",14));
nemanjaCoin.createTransaction(new Transaction("adresa1","adresa2",31));
nemanjaCoin.createTransaction(new Transaction("adresa2","adresa1",45));

console.log("Zapocinje se kopanje...");
nemanjaCoin.minePendingTransactions("Satosi");

nemanjaCoin.createTransaction(new Transaction("adresa1","adresa2",32));
nemanjaCoin.createTransaction(new Transaction("adresa2","adresa1",78));

console.log("Stanje Satosijevih koina je: ",nemanjaCoin.getBalanceAddress("Satosi"));

console.log("Zapocinje se kopanje 2...");
nemanjaCoin.minePendingTransactions("Satosi");

console.log("Stanje Satosijevih koina je: "+ nemanjaCoin.getBalanceAddress("Satosi"));

console.log("Zapocinje se kopanje 2...");
nemanjaCoin.minePendingTransactions("Satosi");

console.log("Stanje Satosijevih koina je: "+ nemanjaCoin.getBalanceAddress("Satosi"));
console.log("Stanje koina adrese 1 je: "+ nemanjaCoin.getBalanceAddress("adresa1"));
