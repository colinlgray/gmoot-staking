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
    const owner = wallet;
    if (
      !program ||
      owner === null ||
      owner.publicKey === null ||
      !props.rewarder ||
      !props.stakeAccount ||
      !props.stakeAccount?.address
    )
      throw new WalletNotConnectedError();
    try {
      if (loading === true) return;
      setLoading(true);
      const stakeAccountAddress = props.stakeAccount.address.toBase58();
      const instructions: web3.TransactionInstruction[] = [];
      if (props.stakeAccount === undefined) {
        throw new Error("still loading stake account, please wait");
      } else if (props.stakeAccount?.data === null) {
        // create stake account if needed
        if (wallet.publicKey === null) {
          throw new WalletNotConnectedError();
        }
        instructions.push(
          program.instruction.initializeStakeAccount(props.stakeAccount.bump, {
            accounts: {
              owner: owner.publicKey,
              stakeAccount: props.stakeAccount.address,
              rewarder: props.rewarder.address,
              systemProgram: web3.SystemProgram.programId,
              rent: web3.SYSVAR_RENT_PUBKEY,
            },
          })
        );
      }

      // create reward account if needed
      const tokenAccountAddress =
        await splToken.Token.getAssociatedTokenAddress(
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
          splToken.TOKEN_PROGRAM_ID,
          props.rewarder.data.rewardMint,
          owner.publicKey,
          false
        );
      const receiverAccount = await connection.getAccountInfo(
        tokenAccountAddress
      );

      if (receiverAccount === null) {
        instructions.push(
          splToken.Token.createAssociatedTokenAccountInstruction(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            splToken.TOKEN_PROGRAM_ID,
            props.rewarder.data.rewardMint,
            tokenAccountAddress,
            owner.publicKey,
            owner.publicKey
          )
        );
      }

      // create PDA Associated Token Account

      const nftMint = new web3.PublicKey(props.nft.data.mint);
      const nftVaultAddress = await splToken.Token.getAssociatedTokenAddress(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        nftMint,
        props.stakeAccount.address,
        true
      );
      const pdaAccount = await connection.getAccountInfo(nftVaultAddress);

      if (pdaAccount === null) {
        instructions.push(
          splToken.Token.createAssociatedTokenAccountInstruction(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            splToken.TOKEN_PROGRAM_ID,
            nftMint,
            nftVaultAddress,
            props.stakeAccount.address,
            owner.publicKey
          )
        );
      }
      const nftTokenAccountAddress =
        await splToken.Token.getAssociatedTokenAddress(
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
          splToken.TOKEN_PROGRAM_ID,
          nftMint,
          owner.publicKey,
          false
        );

      instructions.push(
        program.instruction.stakeGmoot({
          accounts: {
            owner: owner.publicKey.toBase58(),
            rewarder: props.rewarder.address.toBase58(),
            rewardAuthority: props.rewarder.rewardAuthority.toBase58(),
            stakeAccount: stakeAccountAddress,
            rewardMint: props.rewarder.data.rewardMint.toBase58(),
            rewardTokenAccount: tokenAccountAddress.toBase58(),
            nftMint: nftMint.toBase58(),
            nftTokenAccount: nftTokenAccountAddress,
            nftVault: nftVaultAddress.toBase58(),
            tokenProgram: splToken.TOKEN_PROGRAM_ID.toBase58(),
            systemProgram: web3.SystemProgram.programId.toBase58(),
            rent: web3.SYSVAR_RENT_PUBKEY.toBase58(),
            clock: web3.SYSVAR_CLOCK_PUBKEY.toBase58(),
          },
        })
      );
      let transaction = new web3.Transaction().add(...instructions);
      let signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "processed");
      notify("success", "SUCCESS!!!");
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
