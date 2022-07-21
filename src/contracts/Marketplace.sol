pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;

    struct Product {
        uint id;
        string name;
        uint price;
        address payable  owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );
     event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );
    constructor() public {
        name="Dapp University Marketplace";
    } 

    function createProduct(string memory _name,uint _price) public {
        //Make sure parameters are correct
        require(bytes(_name).length>0);
        require(_price>0);
        //Increment product
        productCount++;
        //create product
        products[productCount]= Product(productCount,_name,_price,msg.sender,false);
        //Trigger an event
        emit ProductCreated(productCount,_name,_price,msg.sender,false);
    }

    function purchaseProduct(uint _id) public payable {
        //fetch the product
        Product memory _product = products[_id];
        //fetch the owner
        address payable  _seller = _product.owner;
        //make sure product is valid
        require(_product.id > 0 && _product.id <= productCount); // product id is valid and in range
        require(msg.value>=_product.price); // check if there is enough ether in the transaction
        require(!_product.purchased); // check if product is not already purchased
        require(_seller!=msg.sender); // check if seller is not the buyer
        //Transfer Ownership
        _product.owner=msg.sender;
        //Purchase it 
        _product.purchased=true;
        //update product
        products[_id]=_product;
        //Pay the seller
        address(_seller).transfer(msg.value);
        //Trigger an event
         emit ProductPurchased(productCount,_product.name,_product.price,msg.sender,true);
    }
}