const { assert } = require('chai')

const Marketplace = artifacts.require('./Marketplace.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Marketplace',([deployer,seller,buyer])=> {
    let marketplace 

    before(async()=> {
        marketplace = await Marketplace.deployed()
    })
    describe('deployment',async() => {
        it("deploys successfully",async ()=>{
            const address = await marketplace.address
            assert.notEqual(address,0x0)
            assert.notEqual(address,'')
            assert.notEqual(address,null)
            assert.notEqual(address,undefined )
        })
    })
    it('has a name',async()=>{
        const name = await marketplace.name()
        assert.equal(name,'Dapp University Marketplace')
    })
    describe('products',async() => {
        let result, productCount
    before(async()=> {
        result = await marketplace.createProduct('iphone X',web3.utils.toWei('1','Ether'),{ from: seller})
        productCount = await marketplace.productCount()
    })
    it('creates Products',async()=>{
        //SUCCESS
        assert.equal(productCount,1)
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(),productCount.toNumber(),'id is correct')
        assert.equal(event.name,'iphone X','name is correct')
        assert.equal(event.price,'1000000000000000000','price is correct')
        assert.equal(event.owner,seller,'owner is correct')
        assert.equal(event.purchased,false,'Purchased is correct')

        //FAILURE
        //Blank Name field
        await marketplace.createProduct('',web3.utils.toWei('1','Ether'),{ from: seller}).should.be.rejected;
        //Blank Price field
        await marketplace.createProduct('iphone X',0,{ from: seller}).should.be.rejected;
    })
    it('lists Products',async()=> {
        const product = await marketplace.products(productCount)
        assert.equal(product.id.toNumber(),productCount.toNumber(),'id is correct')
        assert.equal(product.name,'iphone X','name is correct')
        assert.equal(product.price,'1000000000000000000','price is correct')
        assert.equal(product.owner,seller,'owner is correct')
        assert.equal(product.purchased,false,'Purchased is correct')

    })
    it('sells Products',async()=> {
        //Track seller balance before purchase
        let oldSellerBalance
        oldSellerBalance = await web3.eth.getBalance(seller)
        oldSellerBalance = new web3.utils.BN(oldSellerBalance)

        //Buyer makes purchase
        result = await marketplace.purchaseProduct(productCount,{ from:buyer,value:web3.utils.toWei('1','Ether')})

        //Check Logs
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(),productCount.toNumber(),'id is correct')
        assert.equal(event.name,'iphone X','name is correct')
        assert.equal(event.price,'1000000000000000000','price is correct')
        assert.equal(event.owner,buyer,'owner is correct')
        assert.equal(event.purchased,true,'Purchased is correct')

        //check Seller recieve funds
        let newSellerBalance
        newSellerBalance = await web3.eth.getBalance(seller)
        newSellerBalance = new web3.utils.BN(newSellerBalance)

        let price
        price = web3.utils.toWei('1','Ether');
        price = new web3.utils.BN(price)

        const expectedBalance = oldSellerBalance.add(price)

        assert.equal(newSellerBalance.toString(),expectedBalance.toString())
        //FAILURE
        //product id invalid
        await marketplace.purchaseProduct(99,{ from:buyer,value:web3.utils.toWei('1','Ether')}).should.be.rejected;
        //less ether
        await marketplace.purchaseProduct(productCount,{ from:buyer,value:web3.utils.toWei('0.5','Ether')}).should.be.rejected;
        //if product is bought, it cant be bought again
        await marketplace.purchaseProduct(productCount,{ from:deployer,value:web3.utils.toWei('1','Ether')}).should.be.rejected;
        //buyer cant buy his own product 
        await marketplace.purchaseProduct(productCount,{ from:buyer,value:web3.utils.toWei('1','Ether')}).should.be.rejected;
    })
})
})