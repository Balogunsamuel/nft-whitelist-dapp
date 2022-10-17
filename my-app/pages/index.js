import Head from "next/head"
import styles from "../styles/Home.module.css"
import Web3Modal from "web3modal"
import { providers, Contract } from "ethers"
import { useState, useEffect, useRef } from "react"
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants"

export default function Home() {
    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState(false)
    // joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
    const [joinedWhitelist, setJoinWhitelist] = useState(false)
    // loading is set to true when we are waiting for a transaction to get mined
    const [loading, setLoading] = useState(false)
    // numberOfWhitelisted tracks the number of addresses's whitelisted
    const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0)
    // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
    const web3ModalRef = useRef(0)

    /**
     * Returns a Provider or Signer object representing the Ethereum RPC with or without the
     * signing capabilities of metamask attached
     *
     * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
     *
     * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
     * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
     * request signatures from the user using Signer functions.
     *
     * @param {*} needSigner - True if you need the signer, default false otherwise
     */

    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object

        const providerNow = await web3ModalRef.current.connect()
        const web3ProviderNow = new providers.Web3Provider(providerNow)

        // If user is not connected to the Goerli network, let them know and throw an error

        const { chainId } = await web3ProviderNow.getNetwork()
        if (chainId !== 5) {
            window.alert("Change the network to goerli")
            throw new Error("Change network to Goerli!")
        }

        if (needSigner) {
            const signer = web3ProviderNow.getSigner()
            return signer
        }
        return web3ProviderNow
    }

    /**
     * addAddressToWhitelist: Adds the current connected address to the whitelist
     */
    const addAddressToTheWhitelist = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.

            const signer = await getProviderOrSigner(true)
            // Create a new instance of the Contract with a Signer, which allows
            // update methods

            const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer)
            // call the addAddressToWhitelist from the contract

            const tx = await whitelistContract.addAddressToWhitelist()
            setLoading(true)
            // wait for the transaction to get mined

            await tx.wait()
            setLoading(false)
            // get the updated number of addresses in the whitelist
            await getNumberOfWhitelistedAddress()
            setJoinWhitelist(true)
        } catch (error) {
            console.log(error)
        }
    }

    const getNumberOfWhitelistedAddress = async () => {
        try {
            const provider = await getProviderOrSigner()

            const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider)
            //call from contract
            const _numberOfWhitelisted = await whitelistContract.numAlreadyWhitelisted()
            setNumberOfWhitelisted(_numberOfWhitelisted)
        } catch (error) {
            console.log(error)
        }
    }
    /**
     * checkIfAddressInWhitelist: Checks if the address is in whitelist
     */
    const checkIfAddressInWhitelist = async () => {
        try {
            // We will need the signer later to get the user's address
            // Even though it is a read transaction, since Signers are just special kinds of Providers,
            // We can use it in it's place

            const signer = await getProviderOrSigner(true)
            const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer)
            // Get the address associated to the signer which is connected to  MetaMask

            const address = await signer.getAddress()
            // call the whitelistedAddresses from the contract

            const _joinedWhitelist = await whitelistContract.checkWhitelistAddress(address)
            setJoinWhitelist(_joinedWhitelist)
        } catch (error) {
            console.log(error)
        }
    }

    /*
    connectWallet: Connects the MetaMask wallet
  */
    const connectWallet = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // When used for the first time, it prompts the user to connect their wallet

            await getProviderOrSigner()
            setWalletConnected(true)

            checkIfAddressInWhitelist()
            getNumberOfWhitelistedAddress()
        } catch (error) {
            console.log(error)
        }
    }

    /*
    renderButton: Returns a button based on the state of the dapp
  */
    const renderButton = () => {
        if (walletConnected) {
            if (joinedWhitelist) {
                return <div className={styles.descripition}>Thanks For Joining The Whitelist!</div>
            } else if (loading) {
                return <button className={styles.button}>Loading....</button>
            } else {
                return (
                    <button onClick={addAddressToTheWhitelist} className={styles.button}>
                        Join The Whitelist!
                    </button>
                )
            }
        } else {
            return (
                <button onClick={connectWallet} className={styles.button}>
                    Connect Your Wallet
                </button>
            )
        }
    }

    // useEffects are used to react to changes in state of the website
    // The array at the end of function call represents what state changes will trigger this effect
    // In this case, whenever the value of `walletConnected` changes - this effect will be called

    useEffect(() => {
        if (!walletConnected) {
            web3ModalRef.current = new Web3Modal({
                network: "goerli",
                providerOptions: {},
                disableInjectedProvider: false,
            })
            connectWallet()
        }
    }, [walletConnected])
    return (
        <div>
            <Head>
                <title>NFT Whitelist DApp | PiedPiper </title>
                <meta name="description" content="Whitelist-Dapp" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.main}>
                <div>
                    <h1 className={styles.title}>PiedPiper Whitelist Dapp!!! Welcome</h1>
                    <div className={styles.line}></div>
                    <div className={styles.description}>
                        Get whitelisted to my first amazing NFT collection those intrested in
                        blockchain and who supports Real Madrid and wants to become a champion.
                        Let's get lit🔥
                    </div>
                    <div className={styles.description}>
                        {numberOfWhitelisted}/15 have joined the list of whitelisted address.
                    </div>
                    {renderButton()}
                </div>
                <div>
                    <img className={styles.image} src="./Modric-madrid.jpg" />
                </div>
            </div>

            <footer className={styles.footer}>Made with &#10084; by Mayokun</footer>
        </div>
    )
}
