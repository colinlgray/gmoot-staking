import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { FC, useCallback, useState } from "react";
import { Spinner } from "./index";
import { RowProps } from "../containers/NFTRow";
import { useNotify, useProgram } from "../hooks";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { web3 } from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";

export const StakeButton: FC<RowProps> = (props) => {
  const notify = useNotify();

  const [loading, setLoading] = useState(false);
  const program = useProgram();
  const wallet = useWallet();
  const { connection } = useConnection();

  // check has stake account
  const onClick = useCallback(async () => {
    // If there isn't a program it's because the wallet is undefined
    if (
      !program ||
      wallet === null ||
      wallet.publicKey === null ||
      !props.rewarder ||
      !props.stakeAccount
    )
      throw new WalletNotConnectedError();
    try {
      if (loading === true) return;
      setLoading(true);
      let stakeAccount;
      // create stake account
      if (props.stakeAccount === undefined) {
        throw new Error("still loading stake account, please wait");
      } else if (props.stakeAccount?.data === null) {
        stakeAccount = await program.rpc.initializeStakeAccount(
          props.stakeAccount.bump,
          {
            accounts: {
              owner: wallet.publicKey,
              stakeAccount: props.stakeAccount.address,
              rewarder: props.rewarder.address,
              systemProgram: web3.SystemProgram.programId,
              rent: web3.SYSVAR_RENT_PUBKEY,
            },
          }
        );
        console.log("Created Stake Account:", stakeAccount);
      } else {
        stakeAccount = props.stakeAccount?.address.toBase58();
      }
      console.log("using stake account", stakeAccount);
      // create reward account if needed
      const tokenAccountAddress =
        await splToken.Token.getAssociatedTokenAddress(
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
          splToken.TOKEN_PROGRAM_ID,
          props.rewarder.data.rewardMint,
          props.stakeAccount.address,
          true
        );
      const receiverAccount = await connection.getAccountInfo(
        tokenAccountAddress
      );

      console.log(
        "checking for reward account",
        tokenAccountAddress.toBase58(),
        receiverAccount
      );
      const instructions: web3.TransactionInstruction[] = [];
      if (receiverAccount === null) {
        instructions.push(
          splToken.Token.createAssociatedTokenAccountInstruction(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            splToken.TOKEN_PROGRAM_ID,
            props.rewarder.data.rewardMint,
            tokenAccountAddress,
            props.stakeAccount.address,
            wallet.publicKey
          )
        );
      }

      const nftMint = new web3.PublicKey(props.nft.data.mint);
      const PDAassociatedTokenAccountAddress =
        await splToken.Token.getAssociatedTokenAddress(
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
          splToken.TOKEN_PROGRAM_ID,
          nftMint,
          props.stakeAccount.address,
          true
        );
      const pdaAccount = await connection.getAccountInfo(
        PDAassociatedTokenAccountAddress
      );
      console.log(
        "checking for PDAassociatedTokenAccountAddress",
        PDAassociatedTokenAccountAddress.toBase58(),
        pdaAccount
      );
      if (pdaAccount === null) {
        console.log("creating PDA AssociatedTokenAccount");
        instructions.push(
          splToken.Token.createAssociatedTokenAccountInstruction(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            splToken.TOKEN_PROGRAM_ID,
            nftMint,
            PDAassociatedTokenAccountAddress,
            props.stakeAccount.address,
            wallet.publicKey
          )
        );
      }

      if (instructions.length) {
        const transaction = new web3.Transaction().add(...instructions);
        const signature = await wallet.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, "processed");
      }

      // stake nft
      // Error with transaction Error: 167: The given account is not owned by the executing program
      // at Function.parse (error.ts:41)
      // at Object.rpc [as stakeGmoot] (rpc.ts:28)
      // at async StakeButton.tsx:125
      await program.rpc.stakeGmoot({
        accounts: {
          owner: wallet.publicKey,
          rewarder: props.rewarder.address,
          rewardAuthority: props.rewarder.rewardAuthority,
          stakeAccount,
          rewardMint: props.rewarder.data.rewardMint,
          rewardTokenAccount: tokenAccountAddress,
          nftMint: nftMint,
          nftTokenAccount: props.nft.pubkey,
          nftVault: PDAassociatedTokenAccountAddress,
          tokenProgram: splToken.TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
        },
      });

      // notify("success", "SUCCESS!!!");
      setLoading(false);
    } catch (e: any) {
      console.log("Error with transaction", e);
      notify("error", `Transaction failed! ${e?.message}`);
      setLoading(false);
      return;
    }
  }, [notify, loading, program, wallet, props, connection]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <button
      onClick={onClick}
      className="bg-green-500 hover:bg-green-700 font-bold py-1 px-2 rounded"
    >
      Stake
    </button>
  );
};
