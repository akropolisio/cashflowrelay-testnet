import * as React from 'react';
import { bind } from 'decko';
import * as moment from 'moment';
import cn from 'classnames';

import { ShowMainContractData } from 'services/transactions';
import { i18nConnect, ITranslateProps, tKeys as tKeysAll } from 'services/i18n';

import { IToken, TokenType } from 'shared/types/models';
import { ExpansionPanel, ExpansionPanelDetails, Button, DonutChart, ExpansionPanelSummary } from 'shared/view/elements';
import { ContentCopy, CircleArrow } from 'shared/view/elements/Icons';
import { toFixed } from 'shared/helpers/integer';
import { formatNumber } from 'shared/helpers/format';

import Header from './Header/Header';
import { StylesProps, provideStyles } from './TokenCard.style';

const tKeys = tKeysAll.features.manageCashFlows;

type MetricKey =
  keyof Pick<IToken, 'id' | 'payer' | 'instalmentSize' | 'firstInstalmentDate' | 'lastInstalmentDate'> | 'lender';

interface IOwnProps {
  className?: string;
  tokenId: number;
  type: TokenType;
  expanded: boolean;
  onToggle(id: number): void;
  isNeedDisplay?(token: IToken): boolean;
}

type IProps = IOwnProps & StylesProps & ITranslateProps;

class TokenCard extends React.PureComponent<IProps> {
  public render() {
    const { classes, className, type, expanded, t, theme, isNeedDisplay, tokenId } = this.props;

    return (
      <ShowMainContractData<'cashflowFor'> type="cashflowFor" request={{ tokenId }}>
        {({ data: token }) => {
          if (!token) { return 'Token loading...'; }
          if (isNeedDisplay && !isNeedDisplay(token)) { return null; }

          const { instalmentSize, amount } = token;
          const paidAmount = 100; // TODO ds: calculate from orders
          const missedAmount = 100; // TODO ds: calculate from orders
          const dueAmount = 100; // TODO ds: calculate from orders
          const paidPercent = toFixed(paidAmount / instalmentSize.toNumber(), 1);

          return (
            <div className={cn(classes.root, className)}>
              <ExpansionPanel expanded={expanded} onChange={this.onToggle}>
                <ExpansionPanelSummary
                  className={classes.summary}
                  classes={{ content: classes.summaryContent }}
                >
                  <Header
                    token={token}
                    expanded={expanded}
                    type={type}
                  />
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                  <div className={classes.main}>
                    <div className={classes.leftSection} >
                      {(['id', 'payer', 'lender'] as MetricKey[]).map(this.renderMetric.bind(null, token))}
                    </div>
                    <div className={classes.rightSection}>
                      {(['instalmentSize', 'firstInstalmentDate', 'lastInstalmentDate'] as MetricKey[])
                        .map(this.renderMetric.bind(null, token))}
                    </div>
                    <div className={classes.progress}>
                      <DonutChart
                        title={t(
                          tKeys.howMuchInstalmentIsComplete.getKey(),
                          { paid: paidAmount, total: amount.toNumber(), percent: paidPercent },
                        )}
                        total={amount.toNumber()}
                        segments={[
                          { color: theme!.extra.colors.salem, value: paidAmount },
                          { color: theme!.extra.colors.monza, value: missedAmount },
                          { color: theme!.extra.colors.buttercup, value: dueAmount },
                        ]}
                      />
                    </div>
                  </div>
                  {['Repayment history', 'Withdrawal history'].map(stub => (
                    <div key={stub} className={classes.stubSection}>
                      <span>{stub}</span>
                      <CircleArrow />
                    </div>
                  ))}
                </ExpansionPanelDetails>
                <div className={classes.footer}>
                  {this.renderActions()}
                </div>
              </ExpansionPanel>
            </div>
          );
        }}
      </ShowMainContractData>
    );
  }

  @bind
  public onToggle() {
    const { tokenId, onToggle } = this.props;
    onToggle(tokenId);
  }

  @bind
  public renderMetric(token: IToken, key: MetricKey) {
    const { classes, t } = this.props;
    const valueByMetricKey: Record<MetricKey, () => React.ReactNode> = {
      id: () => token.id,
      firstInstalmentDate: () => moment(token.firstInstalmentDate).format('LL'),
      lastInstalmentDate: () => moment(token.lastInstalmentDate).format('LL'),
      instalmentSize: () => t(tKeys.amountPerPeriodicity.getKey(), {
        amount: formatNumber(token.instalmentSize.toNumber(), 2),
        periodicity: moment.duration(token.periodDuration).humanize(),
      }),
      payer: () => token.payer,
      lender: () => (
        <ShowMainContractData<'ownerOf'> type="ownerOf" request={{ tokenId: token.id }}>
          {({ data }) => data || 'Loading...'}
        </ShowMainContractData>
      ),
    };

    return (
      <div key={key} className={classes.metricField}>
        <div className={classes.metricTitle}>
          {t(tKeys[key].getKey())}
        </div>
        <div className={classes.metricValue}>
          {valueByMetricKey[key]()}
          {(key === 'lender' || key === 'payer') && (<>
            <ContentCopy className={classes.icon} />
          </>)}
        </div>
      </div>
    );
  }

  public renderActions() {
    const { classes, t, type } = this.props;
    const onSaleNow: boolean = false; // TODO ds: check token on sale
    const isFullRepaid: boolean = false; // TODO ds: check full repaid

    const withdrawButton = (
      <Button className={classes.footerButton} variant="contained" color="primary">
        {t(tKeys.withdrawDai.getKey())}
      </Button>
    );
    const sellButton = (
      <Button className={classes.footerButton} variant="contained" color="primary" disabled={onSaleNow}>
        {t(tKeys.sellCashflow.getKey())}
      </Button>
    );

    switch (type) {
      case 'incoming':
        return (
          <>
            {sellButton}
            {!onSaleNow && withdrawButton}
          </>
        );
      case 'obligations':
        return (
          <>
            <Button className={classes.footerButton} variant="contained" color="primary" >
              {t(tKeys.payInstalment.getKey())}
            </Button>
            {sellButton}
            {!onSaleNow && isFullRepaid && withdrawButton}
          </>
        );
      case 'selling':
        return (
          <Button className={classes.footerButton} variant="contained" color="primary">
            {t(tKeys.buyCashflow.getKey())}
          </Button>
        );
    }
  }
}

export default i18nConnect(provideStyles(TokenCard));