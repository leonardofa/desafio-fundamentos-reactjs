/* eslint-disable import/no-duplicates */
import React, { useEffect, useState } from 'react';
import pt from 'date-fns/locale/pt';
import { format, parseISO } from 'date-fns';
import currency from 'currency-formatter';
import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';
import Header from '../../components/Header';
import api from '../../services/api';
import { Card, CardContainer, Container, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: string;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    api.get('transactions').then(response => {
      const balanceResponse = response.data.balance as Balance;
      setBalance({
        income: currency.format(Number(balanceResponse.income), {
          code: 'BRL',
        }),
        outcome: currency.format(Number(balanceResponse.outcome), {
          code: 'BRL',
        }),
        total: currency.format(Number(balanceResponse.total), {
          code: 'BRL',
        }),
      });

      const transactionsResponse = response.data.transactions as Transaction[];
      setTransactions(
        transactionsResponse.map(transaction => {
          return {
            ...transaction,
            formattedDate: format(
              parseISO(transaction.created_at),
              'dd/MM/yyyy',
              {
                locale: pt,
              },
            ),
            formattedValue: currency
              .format(
                transaction.value * (transaction.type === 'income' ? 1 : -1),
                { code: 'BRL' },
              )
              .replace('-', '- '),
          };
        }),
      );
    });
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="title">{transaction.title}</td>
                  <td className={transaction.type}>
                    {transaction.formattedValue}
                  </td>
                  <td>{transaction.category.title}</td>
                  <td>{transaction.formattedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
