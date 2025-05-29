
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchTransactions } from '@/services/transactionService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CreditCard,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowRight,
  PlusCircle,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Mock transaction data
const mockTransactions = [
  {
    id: '1',
    date: '2023-10-15',
    amount: 1250.00,
    currency: 'USD',
    recipient: 'John Smith',
    status: 'completed',
    method: 'SWIFT',
    reference: 'INV-2023-001',
  },
  {
    id: '2',
    date: '2023-10-10',
    amount: 800.50,
    currency: 'EUR',
    recipient: 'Maria Garcia',
    status: 'processing',
    method: 'SWIFT',
    reference: 'INV-2023-002',
  },
  {
    id: '3',
    date: '2023-10-05',
    amount: 5000.00,
    currency: 'GBP',
    recipient: 'Robert Johnson',
    status: 'completed',
    method: 'ACH',
    reference: 'INV-2023-003',
  },
  {
    id: '4',
    date: '2023-09-28',
    amount: 1750.25,
    currency: 'JPY',
    recipient: 'Akira Tanaka',
    status: 'failed',
    method: 'SWIFT',
    reference: 'INV-2023-004',
  },
];

// Format date function
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format currency function
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch transactions on component mount
  useEffect(() => {
    if (user?.id) {
      loadTransactions();
    }
  }, [user?.id]);

  const loadTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions(user.id);
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transactions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh transaction data (simulated)
  const refreshTransactions = () => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-warning-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  // Calculate summary data
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const totalSent = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const averageAmount = completedTransactions.length > 0 
    ? totalSent / completedTransactions.length 
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-navy-800">Welcome, {user?.fullName}</h1>
          <p className="text-muted-foreground">Manage your international payments</p>
        </div>
        <Link to="/create-payment">
          <Button className="btn-primary">
            <PlusCircle className="h-5 w-5 mr-2" />
            New Payment
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-navy-500 mr-3" />
              <div>
                <div className="text-3xl font-bold text-navy-800">{transactions.length}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel animate-fade-in [animation-delay:100ms]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-navy-500 mr-3" />
              <div>
                <div className="text-3xl font-bold text-navy-800">${totalSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Completed transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel animate-fade-in [animation-delay:200ms]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-navy-500 mr-3" />
              <div>
                <div className="text-3xl font-bold text-navy-800">${averageAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="glass-panel border-white/20 shadow-glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={refreshTransactions}
              disabled={isLoading}
            >
              <RefreshCw className={cn(
                "h-4 w-4 mr-2", 
                isLoading && "animate-spin"
              )} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Recipient</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr 
                    key={transaction.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        {formatDate(transaction.date)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                    <td className="py-3 px-4">{transaction.recipient}</td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center px-2 py-1 bg-navy-50 text-navy-700 rounded-full text-xs">
                        {transaction.method}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(transaction.status)}
                        <span className={cn(
                          "ml-1.5 capitalize",
                          transaction.status === "completed" && "text-success-700",
                          transaction.status === "processing" && "text-warning-700",
                          transaction.status === "failed" && "text-destructive"
                        )}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8">
                        <span className="text-navy-500">Details</span>
                        <ArrowRight className="h-4 w-4 ml-1 text-navy-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
