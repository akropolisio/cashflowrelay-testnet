import * as React from 'react';
import { bind } from 'decko';
import { Form } from 'react-final-form';
import { MarkAs } from '_helpers';
import { connect } from 'react-redux';
import * as moment from 'moment';
import BigNumber from 'bignumber.js';
import createDecorator from 'final-form-calculate';

import { i18nConnect, ITranslateProps, tKeys as allKeys, ITranslateKey } from 'services/i18n';
import { actions as transactionActions } from 'services/transactions';
import { lessThenOrEqual, moreThenOrEqual, moreThen, isRequired } from 'shared/validators';
import { calcRepaymentAmount, calcInstallmentSize, OneDAI } from 'shared/helpers/model';
import { TextInputField } from 'shared/view/form';
import { Button } from 'shared/view/elements';

import { createCashFlowConfig } from '../../../constants';
import { LoanSummary, ConfigurationCommitment } from '../../components';
import { IFormData } from '../../../namespace';
import { StylesProps, provideStyles } from './CreateCashFlowForm.style';
import { DrawerModal } from 'shared/view/components';
import CashFlowInfo from 'shared/view/model/CashFlowInfo/CashFlowInfo';

const tKeys = allKeys.features.createCashFlow.form;

interface IPreparedFormData {
  firstInstallmentDate: number;
  lastInstallmentDate: number;
  installmentSize: number;
  duration: number;
  interest: number;
  amount: number;
  repayingAmount: number;
  periodDuration: number;
}

// tslint:disable-next-line:no-empty-interface
interface IOwnProps {
  // onSuccess(): void;
}

type IActionProps = typeof mapDispatch;

type IProps = IOwnProps & IActionProps & StylesProps & ITranslateProps;

interface IState {
  openConfirmModal: boolean;
}

const initialValues: IFormData = {
  name: createCashFlowConfig.defaultName,
  amount: createCashFlowConfig.defaultAmount,
  interest: createCashFlowConfig.defaultInterest,
  installmentSize: calcInstallmentSize(
    createCashFlowConfig.defaultAmount,
    createCashFlowConfig.defaultInterest,
    createCashFlowConfig.defaultInstallmentCount,
  ).toNumber(),
  installmentCount: createCashFlowConfig.defaultInstallmentCount,
  periodicity: createCashFlowConfig.defaultPeriodicity,
};

const names: { [key in keyof IFormData]: key } = {
  name: 'name',
  amount: 'amount',
  interest: 'interest',
  installmentSize: 'installmentSize',
  installmentCount: 'installmentCount',
  periodicity: 'periodicity',
};

function validateForm(values: IFormData): Partial<MarkAs<ITranslateKey, IFormData>> {
  return {
    name: isRequired(values.name),
    interest: (
      moreThenOrEqual(createCashFlowConfig.minInterest, values.interest) ||
      lessThenOrEqual(createCashFlowConfig.maxInterest, values.interest)
    ),
    amount: moreThen(createCashFlowConfig.minAmount, values.amount),
    installmentCount: moreThen(createCashFlowConfig.minInstallmentCount, values.installmentCount),

  };
}

const calculateDecorator = createDecorator({
  field: names.amount,
  updates: {
    [names.installmentSize]: (amount: number, all: IFormData): number =>
      calcInstallmentSize(amount, all.interest, all.installmentCount).toNumber(),
  },
}, {
    field: names.interest,
    updates: {
      [names.installmentSize]: (interest: number, all: IFormData): number =>
        calcInstallmentSize(all.amount, interest, all.installmentCount).toNumber(),
    },
  }, {
    field: names.installmentCount,
    updates: {
      [names.installmentSize]: (installmentCount: number, all: IFormData): number =>
        calcInstallmentSize(all.amount, all.interest, installmentCount).toNumber(),
    },
  });

class CreateCashFlowForm extends React.PureComponent<IProps> {
  public state: IState = { openConfirmModal: false };

  public render() {
    const { classes, t } = this.props;

    return (
      <Form
        onSubmit={this.onSubmit}
        validate={validateForm}
        initialValues={initialValues}
        subscription={{ values: true }}
        decorators={[calculateDecorator]}
      >
        {({ handleSubmit, values }) => {
          const {
            firstInstallmentDate, lastInstallmentDate, installmentSize,
            duration, interest, amount, repayingAmount, periodDuration,
          } = this.convertFormValues(values as IFormData);
          return (
            <form className={classes.root} onSubmit={handleSubmit}>
              <div className={classes.commitmentFields}>
                <ConfigurationCommitment />
              </div>
              <div className={classes.loanSummary}>
                <LoanSummary
                  nameInput={<TextInputField name="name" required fullWidth />}
                  firstInstallmentDate={firstInstallmentDate}
                  lastInstallmentDate={lastInstallmentDate}
                  installmentSize={installmentSize}
                  duration={duration}
                  interest={interest}
                  amount={amount}
                  repayingAmount={repayingAmount}
                  periodDuration={periodDuration}
                  actions={[
                    <Button key="" onClick={this.openConfirmModal} fullWidth variant="contained" color="primary">
                      {t(tKeys.submitButton.getKey())}
                    </Button>]
                  }
                />
              </div>
              <DrawerModal
                open={this.state.openConfirmModal}
                title={values.name}
                onClose={this.closeConfirmModal}
                hint={t(tKeys.creationHint.getKey())}
                actions={
                  [<Button variant="contained" color="primary" key="" fullWidth>
                    {t(tKeys.createCashFlow.getKey())}
                  </Button>]
                }
              >
                <CashFlowInfo
                  token={{
                    instalmentSize: new BigNumber(installmentSize),
                    amount: new BigNumber(amount),
                    duration,
                    firstInstalmentDate: firstInstallmentDate,
                    lastInstalmentDate: lastInstallmentDate,
                    periodDuration,
                  }}
                  repayingAmount={repayingAmount}
                  fields={['instalmentSize', 'duration', 'firstInstalmentDate', 'lastInstalmentDate']}
                />
              </DrawerModal>
            </form>
          );
        }}
      </Form>
    );
  }

  @bind
  private closeConfirmModal() {
    this.setState({ openConfirmModal: false });
  }

  @bind
  private openConfirmModal() {
    this.setState({ openConfirmModal: true });
  }

  private convertFormValues(values: IFormData): IPreparedFormData {
    const { installmentCount, periodicity, installmentSize, interest, amount } = values as IFormData;
    const today = moment();
    const lastInstallmentDate = moment().add(installmentCount, periodicity);
    const diff = lastInstallmentDate.diff(today);
    const duration = moment.duration(diff);
    const periodDuration = (lastInstallmentDate.valueOf() - today.valueOf()) / installmentCount;
    const repayingAmount = amount + amount * (interest / 100);

    return {
      interest,
      amount,
      installmentSize,
      firstInstallmentDate: today.valueOf(),
      lastInstallmentDate: lastInstallmentDate.valueOf(),
      periodDuration,
      duration: duration.asMilliseconds(),
      repayingAmount,
    };
  }
  @bind
  private onSubmit(data: IFormData) {
    const { sendTransaction } = this.props;
    const value = OneDAI.times(calcRepaymentAmount(data.amount, data.interest));
    const commit = value.div(data.installmentCount).integerValue(BigNumber.ROUND_CEIL);
    const resultValue = commit.times(data.installmentCount);

    sendTransaction({
      type: 'createCashFlow',
      data: {
        name: data.name,
        value: resultValue,
        commit,
        duration: moment.duration(data.installmentCount, data.periodicity).asSeconds(),
        interestRate: data.interest,
      },
    });
  }
}

const mapDispatch = {
  sendTransaction: transactionActions.sendTransaction,
};

export { IOwnProps };
export default (
  connect(null, mapDispatch)(
    i18nConnect(
      provideStyles(
        CreateCashFlowForm,
      ),
    ),
  )
);
