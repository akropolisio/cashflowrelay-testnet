import { IAppReduxState } from 'shared/types/app';
import { makeCommunicationSelector } from 'shared/helpers/redux';

import * as NS from '../namespace';
import { IOrderList } from 'shared/types/models';

export function selectState(state: IAppReduxState): NS.IReduxState {
  return state.orderbook;
}

export const selectCommunication = makeCommunicationSelector(selectState);

export function selectMyOrders(state: IAppReduxState) {
  return selectState(state).data.myOrders;
}

export function selectOrders(state: IAppReduxState) {
  const orders = selectState(state).data.orders;
  const hideOrders = selectHideOrders(state);
  const filteredOrders = {...orders, records: getFilteredOrders(orders.records, hideOrders)};
  return filteredOrders;
}

export function selectHideOrders(state: IAppReduxState) {
  return selectState(state).data.hideOrders;
}

function getFilteredOrders(orders: IOrderList['records'], hideOrders: NS.TokenId[]) {
  return orders.filter(order => !hideOrders.includes(order.tokenId));
}
