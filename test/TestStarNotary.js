const StarNotary = artifacts.require("StarNotary");

/**
 * Variables Declaration
 */
var accounts;
var owner;
var user1;
var user2;
var starId = 0;
var starPrice = web3.utils.toWei(".01", "ether");
var balance = web3.utils.toWei(".05", "ether");

/**
 * SetUp
 */
contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accs[0];
});
user1 = accounts[1];
user2 = accounts[2];

beforeEach(async () => {
    instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star ' + String(++starId), starId, {from: user1});
});

/**
 * Tests
 */
describe('General Tests - Happy path', () => {
    it('can Create a Star', async() => {
        assert.equal(await instance.tokenIdToStarInfo.call(starId), 'Awesome Star ' + String(starId));
    });

    it('lets user1 put up their star for sale', async() => {
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        assert.equal(await instance.starsForSale.call(starId), starPrice);
    });

    it('lets user1 get the funds after the sale', async() => {
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
        await instance.buyStar(starId, {from: user2, value: balance});
        let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
        let valueBeforePlusStar = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
        let valueAfterTransaction = Number(balanceOfUser1AfterTransaction);
        assert.equal(valueBeforePlusStar, valueAfterTransaction);
    });

    it('lets user2 buy a star, if it is put up for sale', async() => {
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        await instance.buyStar(starId, {from: user2, value: balance});
        assert.equal(await instance.ownerOf.call(starId), user2);
    });

    it('lets user2 buy a star and decreases its balance in ether', async() => {
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
        await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
        const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
        let balanceDifference = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
        assert.equal(balanceDifference, starPrice);
    });

    // Implement Task 2 Add supporting unit tests

    it('can add the star name and star symbol properly', async() => {
        // 1. create a Star with different tokenId
        // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
        let tokenName = await instance.name.call();
        assert.equal(tokenName, "Crypto Dolar");
        let tokenSymbol = await instance.symbol.call();
        assert.equal(tokenSymbol, "CRYDO");
    });
    
    it('lets 2 users exchange stars', async() => {
        // 1. create 2 Stars with different tokenId
        // 2. Call the exchangeStars functions implemented in the Smart Contract
        // 3. Verify that the owners changed
        let starOne = starId;
        await instance.createStar('Awesome Star ' + String(++starId), starId, {from: user2});
        await instance.exchangeStars(starOne, starId, {from: user1});
        
        let shouldBeUser1 = await instance.ownerOf(starId);
        let shouldBeUser2 = await instance.ownerOf(starOne);
        
        assert.equal(shouldBeUser1, user1);
        assert.equal(shouldBeUser2, user2)
    });

    it('lets a user transfer a star', async() => {
        // 1. create a Star with different tokenId
        // 2. use the transferStar function implemented in the Smart Contract
        // 3. Verify the star owner changed.
        await instance.transferStar(user2, starId, {from: user1});
        let shouldBeUser2 = await instance.ownerOf(starId);
        assert.equal(shouldBeUser2, user2);
    });

    it('lookUptokenIdToStarInfo test', async() => {
        // 1. create a Star with different tokenId
        // 2. Call your method lookUptokenIdToStarInfo
        let star = await instance.lookUptokenIdToStarInfo(starId);
        // 3. Verify if you Star name is the same
        assert.equal(star, "Awesome Star " + String(starId));
    });
});