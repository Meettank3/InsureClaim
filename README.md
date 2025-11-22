# InsureClaim - Decentralized Insurance Platform

A blockchain-based insurance application that brings transparency and trust to policy management. **InsureClaim** allows users to purchase insurance policies and file claims directly on the Ethereum blockchain, while administrators can verify and approve claims for instant payouts.

**🚀 Live Demo:** [https://insurechains.netlify.app/](https://insurechains.netlify.app/)

## 📜 Overview

The traditional insurance sector suffers from opacity, slow processing times, and trust issues between insurers and policyholders. **InsureClaim** solves this by using Smart Contracts to automate the lifecycle of an insurance policy. From premium payments to claim settlements, every transaction is recorded on the blockchain, ensuring that the process is tamper-proof and efficient.

## ✨ Features

* **Purchase Policy:** Users can view available insurance plans and purchase them securely using cryptocurrency (ETH).
* **File Claims:** Policyholders can easily submit claims with supporting details directly through the dApp.
* **Admin Dashboard:** Designated administrators can review submitted claims and approve or reject them.
* **Instant Payouts:** Upon approval, funds are automatically transferred from the contract pool to the user's wallet.
* **Transparency:** All transactions and policy statuses are visible and immutable on the blockchain.

## 🛠️ Tech Stack

* **Frontend:** React.js, CSS (Tailwind or custom)
* **Blockchain:** Solidity, Hardhat, Ethers.js
* **Deployment:** Netlify (Frontend), Alchemy/Hardhat (Blockchain)

## 📂 Project Structure

```bash
InsureClaim/
├── client/             # React Frontend code
│   ├── src/
│   ├── public/
│   └── package.json
├── contracts/          # Solidity Smart Contracts
│   └── Insurance.sol   # Main logic for policies and claims
├── scripts/            # Deployment scripts
│   └── deploy.js
├── test/               # Smart contract tests
├── hardhat.config.js   # Hardhat configuration
└── package.json        # Root dependencies
