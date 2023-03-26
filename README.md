# Apes Legacy 

## Enabling Inheritance of BAYC, MAYC and BAKC

 - **Apes Legacy** enables BAYC, MAYC and BAKC **inheritance**.  
 - **Rachel** wants to send all her Apes to her son when she is 60 and retire on a desert island
   with no Internet connection. Just set the date of her 60th birthday as `deadline`, the address
   of her son as `beneficiary` and... *Done!*   
 - **Alice** has a daughter. Alice wants to send her Ape to her daughter when she is 16 years old.
   Just set the daughter's address as `beneficiary` and the date of her sixteen as `deadline`. *Done!*
 - **Bob** wants to hold their Apes until the end 💎, then send them to his caretaker. Just set the
   caretaker's address as `beneficiary` and for the `deadline` he set January, 1st. Every December Bob
   updates the `deadline` to the next year. *Done!*
 - **David** has no descendants, but he wants to send their Apes to his nephews and nieces when they
   are 14 years old. Just choose a `tokenId` for each one, and set each `deadline` to the birthday of
   its corresponding `beneficiary`. *Done!*
 - The **mechanism** is not like the real world **inheritance.** It is *decentralized, fast, easy,
   cheap, no paperwork, no third parties, infallible, immutable, flexible, trusted...* So, **better**.
 - Also, the mechanism could be used as a way to add a secondary wallet to manage Apes for sec
   purposes, maybe a **recovery** after lost the keys for the main wallet.

## How it works

 - An **Ape holder** (BAYC, MAYC or BAKC) may set a **beneficiary** wallet address as of a **deadline** for 
   *one of their tokens* or *for all of them.*
 - The **beneficiary** will be able to **claim** the Ape(s) after reach the **deadline**.
 - The **registrant** may **change** the **beneficiary** and/or the **deadline** as many times as desired.
 - The **registrant** may change the **beneficiary** to the *zero address* or the **deadline** to zero to **cancel**
   any previous register *for tokenId* or *for all of them*.

## Technical details

 - The contract stores the **state** of the inheritance registry using 2 *mappings*. The first stores
   the `beneficiary` of a `tokenId` of an specific holder. The second stores the `deadline` in the same
   way. Both are using *MaxUint256* as `tokenId` to represent the *forAll* registry.
 - The **register/unregister flow** consists on update these *mappings*.
 - The **claim token(s) flow** consists on *transfer* the token(s) after check these *mappings*.
 - The service includes a **notification system** to help the registrants like Bob not to miss the
   extension of the claim date. This system uses the **Push protocol** and **Polybase**.
 - Yeah, I know, this is nothing complex, but that's all!.

## Price (ApeCoin)

 - Currently the service must to be paid using the **Ape Coin token**.
 - The price for **tokenId** is **3 Ape Coin**.
 - The price for **all tokens** is **10 Ape Coin**.
 - The price must to be paid only the **first time** using the service. (*for tokenId* and *forAll*)
 
 ## Push Notifications 
 
 - The registrant may set the notifications ON/OFF to start/stop receiving notifications trough the Push Protocol.
 - The registrant may set the desired days to be notified before reach the claim date. A notification will be sent daily.
 - This mechanism should help registrants to remember that they need to extend their claim date.
 - To receive the notifications the registrants should download the Push App in their smartphones.
 - The ShowRunners framework will send the notifications to the required users. To know about users and deadlines
   the framework is using the getSubscribers function and fetching data from Polybase, a decentralized database.
 - Relevant Push files are `frontend/components/NotifyComponent.jsx` and `showrunners/src/showrunners/jvaleska/*`.
 
 ## Polybase
 
 - The decentralized database is in charge of store the necessary data to manage the notifications trough the Push Protocol.
 - Polybase requires the registrant's signature to create/update/delete their data from the database. Your keys, your data.  
 - The registrant may change the number of days to be notified before reach the claim date without problem.
 - The registrant is in charge to update the claim date stored in Polybase whenever he/she changes this date in the blockchain.
 - The previous feature could be done automatically at the moment of register an Ape to the service. Separated for simplicity.
 - The registrant may delete their data from the database to stop receiving notifications in the future.
 - Relevant Polybase files are `polybase.schema`, `frontend/components/NotifyComponent.jsx` and `showrunners/src/showrunners/jvaleska/jvaleskaChannel.ts`.

## Goerli Contracts

-  [Inherit Apes BAYC contract](https://goerli.etherscan.io/address/0x7CD10B154BC11Dd0Dd2f51435D4802F8bCAF35b5)
-  [Inherit Apes MAYC contract](https://goerli.etherscan.io/address/0xe667745d7551c01B96b143C350E49C2C4816573f)
-  [Inherit Apes BAKC contract](https://goerli.etherscan.io/address/0xA73CB0f4A8e4e4501157D5673373221DD2cBEd33)
 - [Using AlphaToken contract as BAYC.](https://goerli.etherscan.io/address/0xF40299b626ef6E197F5d9DE9315076CAB788B6Ef)
 - [Using BetaToken contract as MAYC.](https://goerli.etherscan.io/address/0x3f228cBceC3aD130c45D21664f2C7f5b23130d23)
 - [Using GammaToken contract as BAKC.](https://goerli.etherscan.io/address/0xd60d682764Ee04e54707Bee7B564DC65b31884D0)
 - [Using M20 contract as Ape Coin.](https://goerli.etherscan.io/address/0x328507DC29C95c170B56a1b3A758eB7a9E73455c)

## Apes Legacy dApp Flow

### Ape Holder flow 

 1. Connect a wallet pointing to the Goerli network.
 1. Select a collection: BAYC, MAYC or BAKC.
 1. Select Register.
 1. Select one token or select all of them.
 1. Ensure you have enough Ape Coin to pay for the service and Goerli ETH for the gas, of course.
 1. Fill the form. Select a date and a beneficiary address.
 1. Press Register button. 3 pop-ups will appear.
 1. Approve the contract to take your Ape Coin as payment.
 1. Approve the contract to send your Ape(s) when the deadline will be reached.
 1. Finally, register your Ape into the service calling the contract.
 1. After that, you are done! The Ape(s) is/are registered into the service and the beneficiary 
    will be able to claim it/them after reach the deadline.
    
This flow will fail in the following scenarios:
- The deadline is a date in the past.
- The caller has not enough funds.
- The caller didn't approve the contract.
- The caller revoked the approval to the contract.
 
### Beneficiary flow

 1. Connect a wallet pointing to the Goerli network.
 1.	Select a collection: BAYC, MAYC or BAKC.
 1. Select Claim.
 1. Type the tokenId and press Claim. (for tokenId) or Type the regsitrant address and press Claim. (forAll)
 1. Well done! The Ape(s) is now in your wallet.
 
This flow will fail in the following scenarios:
- The deadline is not reached.
- The caller is not the beneficiary.
- The ape holder revoked the approval to the contract.
- The ape holder transferred the asset(s).
- The ape holder burnt the asset(s).

### Notifications flow

#### Activate (Opt-in)

1. Connect a wallet pointing to the Goerli network.
1. Select a collection: BAYC, MAYC or BAKC.
1. Select Notify.
1. Choose the desired number of days to be notified before the claim date.
1. Press Activate Notifications. Some pop-ups will appear. These signatures do not require gas.
   (Maybe too much pop-ups, even more if I allow users to activate the notifications at the same time they register an ape... 5+ pop ups lol)
1. Approve the first one to Opt-In (subscribe) to the Apes Legacy channel (Push Protocol)
1. Approve the second one to Sign In to Polybase.
1. Finally, accept the next ones to create your user account and to store your preferences about the notifications (Polybase)
1. Download the Push dApp to get notified in your smartphone! Done!

#### Cancel (Opt-out)

1. Connect a wallet pointing to the Goerli network.
1. Select a collection: BAYC, MAYC or BAKC.
1. Select Notify.
1. Press Cancel Notifications. Some pop-ups will appear. These signatures do not require gas.
1. Approve the first one to Opt-Out (Unsubscribe) to the Apes Legacy channel (Push Protocol)
1. Approve the second one to Sign In to Polybase.
1. Finally, accept the next ones to delete your user account and your preferences about the notifications (Polybase).

