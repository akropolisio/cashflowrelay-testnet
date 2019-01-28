import { IAction } from 'shared/types/redux';
import { TransactionRequest } from 'shared/types/models';

export interface IReduxState {
  data: {
    sentTransactions: ITransactionInfo[];
  };
}

export interface ITransactionInfo {
  stackId: string;
  request: TransactionRequest;
}

export type IDeleteTransactionInfo = IAction<'TRANSACTIONS:DELETE_TRANSACTION_INFO', { stackId: string }>;

export type IPushTransactionInfo = IAction<'TRANSACTIONS:PUSH_TRANSACTION_INFO', ITransactionInfo>;

export type ISendTransaction = IAction<'TRANSACTIONS:SEND_TRANSACTION', TransactionRequest>;

export type Action =
  | ISendTransaction
  | IPushTransactionInfo
  | IDeleteTransactionInfo;
