import { withStyles, Theme, WithStyles } from 'shared/styles';

import { rule } from 'shared/helpers/style';

const styles = ({ extra: theme }: Theme) => ({
  root: rule({
  }),

  main: rule({
    width: '100%',
    display: 'flex',
    paddingBottom: '2.5rem',
    borderBottom: `solid 0.0625rem ${theme.colors.mercury}`,
  }),

  summary: rule({
    boxShadow: '0 0.125rem 0.25rem 0 rgba(184, 184, 184, 0.5)',
  }),

  details: rule({
    display: 'block',
    padding: '2.1875rem',
  }),

  leftSection: rule({
    flexBasis: '55%',
    marginRight: '2.875rem',
  }),

  rightSection: rule({
    flexBasis: '40%',
  }),

  metricField: rule({
    display: 'flex',
  }),

  metric: rule({
    marginBottom: '1.125rem',
    fontSize: '0.75rem',
    lineHeight: '1.125rem',
    color: theme.palette.text.primary,
  }),

  metricTitle: rule({
    composes: '$metric',
    flexBasis: '30%',
    fontWeight: 600,

    '$rightSection & ': {
      flexBasis: '35%',
    },
  }),

  metricValue: rule({
    composes: '$metric',
    display: 'flex',
    alignItems: 'center',
  }),

  icon: rule({
    fontSize: '1.125rem',
    marginLeft: '1rem',
    color: theme.colors.dustyGray,
  }),

  progress: rule({
    width: '7.375rem',
    height: '7.375rem',
    marginRight: '0.9375rem',
  }),

  stubSection: rule({
    height: '4.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 0.5,
    borderBottom: `solid 0.0625rem ${theme.colors.mercury}`,
    fontSize: '1.125rem',
    fontWeight: 600,
  }),

  footer: rule({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '2.25rem',
  }),

  footerButton: rule({
    marginLeft: '1.25rem',
  }),
});

export const provideStyles = withStyles(styles);

export type StylesProps = WithStyles<typeof styles>;
