
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Search,
  ArrowUpDown,
  AlertCircle,
  ChevronDown,
  Send,
  Eye,
  File,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock transaction data
const mockTransactions = [
  {
    id: '1',
    date: '2023-10-19',
    amount: 5000.00,
    currency: 'USD',
    senderName: 'John Doe',
    senderAccount: '1234567890',
    recipientName: 'Wang Li',
    recipientBank: 'Bank of China',
    recipientCountry: 'China',
    recipientSwift: 'BKCHCNBJ',
    method: 'SWIFT',
    status: 'pending',
    reference: 'INV20231019-001',
  },
  {
    id: '2',
    date: '2023-10-18',
    amount: 3500.75,
    currency: 'EUR',
    senderName: 'John Doe',
    senderAccount: '1234567890',
    recipientName: 'Maria Garcia',
    recipientBank: 'Santander',
    recipientCountry: 'Spain',
    recipientSwift: 'SANTESMM',
    method: 'SWIFT',
    status: 'pending',
    reference: 'INV20231018-002',
  },
  {
    id: '3',
    date: '2023-10-17',
    amount: 7800.50,
    currency: 'GBP',
    senderName: 'Alice Johnson',
    senderAccount: '9876543210',
    recipientName: 'James Wilson',
    recipientBank: 'Barclays',
    recipientCountry: 'United Kingdom',
    recipientSwift: 'BARCGB22',
    method: 'ACH',
    status: 'verified',
    reference: 'INV20231017-003',
  },
  {
    id: '4',
    date: '2023-10-16',
    amount: 12000.00,
    currency: 'USD',
    senderName: 'Robert Brown',
    senderAccount: '6547893210',
    recipientName: 'Akira Tanaka',
    recipientBank: 'Mizuho Bank',
    recipientCountry: 'Japan',
    recipientSwift: 'MHCBJPJT',
    method: 'SWIFT',
    status: 'verified',
    reference: 'INV20231016-004',
  },
  {
    id: '5',
    date: '2023-10-15',
    amount: 9200.25,
    currency: 'CAD',
    senderName: 'Sarah Wilson',
    senderAccount: '3216549870',
    recipientName: 'Pierre Dubois',
    recipientBank: 'BNP Paribas',
    recipientCountry: 'France',
    recipientSwift: 'BNPAFRPP',
    method: 'ACH',
    status: 'rejected',
    reference: 'INV20231015-005',
  },
  {
    id: '6',
    date: '2023-10-14',
    amount: 4500.80,
    currency: 'USD',
    senderName: 'Michael Thompson',
    senderAccount: '7539514682',
    recipientName: 'Hans Schmidt',
    recipientBank: 'Deutsche Bank',
    recipientCountry: 'Germany',
    recipientSwift: 'DEUTDEFF',
    method: 'SWIFT',
    status: 'pending',
    reference: 'INV20231014-006',
  },
];

// Format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

type Transaction = typeof mockTransactions[0];

const VerificationPortal: React.FC = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      // In a real app, this would fetch fresh data from an API
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle verify
  const handleVerify = (id: string) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, status: 'verified' } 
          : transaction
      )
    );
    toast.success('Payment verified successfully');
  };
  
  // Handle reject
  const handleReject = (id: string) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, status: 'rejected' } 
          : transaction
      )
    );
    toast.success('Payment rejected');
  };
  
  // Handle view details
  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsDialogOpen(true);
  };
  
  // Handle checkbox selection
  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };
  
  // Handle submit to SWIFT
  const handleSubmitToSwift = () => {
    // Get verified transactions only
    const verifiedIds = transactions
      .filter(t => t.status === 'verified')
      .map(t => t.id);
    
    if (verifiedIds.length === 0) {
      toast.error('No verified transactions to submit');
      return;
    }
    
    setIsSubmitDialogOpen(true);
  };
  
  // Process submit to SWIFT
  const processSubmitToSwift = () => {
    setIsLoading(true);
    
    // In a real app, this would be an API call to submit transactions to SWIFT
    setTimeout(() => {
      // Update transactions to show as submitted
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.status === 'verified' 
            ? { ...transaction, status: 'submitted' } 
            : transaction
        )
      );
      
      setIsLoading(false);
      setIsSubmitDialogOpen(false);
      toast.success('Payments successfully submitted to SWIFT');
    }, 2000);
  };
  
  // Apply filters and search
  const filteredTransactions = transactions
    .filter(transaction => {
      // Apply status filter
      if (filterStatus && transaction.status !== filterStatus) {
        return false;
      }
      
      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          transaction.senderName.toLowerCase().includes(searchLower) ||
          transaction.recipientName.toLowerCase().includes(searchLower) ||
          transaction.reference.toLowerCase().includes(searchLower) ||
          transaction.recipientSwift.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </div>
        );
      case 'verified':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </div>
        );
      case 'submitted':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Send className="h-3 w-3 mr-1" />
            Submitted
          </div>
        );
      default:
        return null;
    }
  };
  
  // Statistics
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const verifiedCount = transactions.filter(t => t.status === 'verified').length;
  const rejectedCount = transactions.filter(t => t.status === 'rejected').length;
  const submittedCount = transactions.filter(t => t.status === 'submitted').length;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-navy-800">Payment Verification Portal</h1>
          <p className="text-muted-foreground">Review and verify international payments</p>
        </div>
        <Button 
          onClick={handleSubmitToSwift} 
          className="btn-primary"
          disabled={verifiedCount === 0}
        >
          <Send className="h-5 w-5 mr-2" />
          Submit to SWIFT ({verifiedCount})
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-panel animate-fade-in">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-navy-800">{pendingCount}</p>
            </div>
            <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel animate-fade-in [animation-delay:100ms]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold text-navy-800">{verifiedCount}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel animate-fade-in [animation-delay:200ms]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-navy-800">{rejectedCount}</p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel animate-fade-in [animation-delay:300ms]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Submitted</p>
              <p className="text-2xl font-bold text-navy-800">{submittedCount}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <Card className="glass-panel border-white/20 shadow-glass">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Payment Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-9"
              >
                <RefreshCw className={cn(
                  "h-4 w-4 mr-2", 
                  isLoading && "animate-spin"
                )} />
                Refresh
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => setFilterStatus(null)}
                    className={cn("cursor-pointer", !filterStatus && "bg-navy-50")}
                  >
                    All Transactions
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setFilterStatus('pending')}
                    className={cn("cursor-pointer", filterStatus === 'pending' && "bg-navy-50")}
                  >
                    Pending Only
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setFilterStatus('verified')}
                    className={cn("cursor-pointer", filterStatus === 'verified' && "bg-navy-50")}
                  >
                    Verified Only
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setFilterStatus('rejected')}
                    className={cn("cursor-pointer", filterStatus === 'rejected' && "bg-navy-50")}
                  >
                    Rejected Only
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setFilterStatus('submitted')}
                    className={cn("cursor-pointer", filterStatus === 'submitted' && "bg-navy-50")}
                  >
                    Submitted Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Search and Sort controls */}
          <div className="flex items-center mt-4 gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search by name, reference or SWIFT code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 input-field py-2"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="h-9"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortDirection === 'asc' ? 'Oldest First' : 'Newest First'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[160px]">Reference</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead className="w-[140px]">Amount</TableHead>
                    <TableHead className="w-[100px] text-center">Method</TableHead>
                    <TableHead className="w-[120px] text-center">Status</TableHead>
                    <TableHead className="w-[180px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-navy-50/30">
                      <TableCell className="align-middle">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(transaction.id)}
                          onChange={() => handleSelectTransaction(transaction.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                      <TableCell className="font-mono text-xs">{transaction.reference}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.senderName}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            Acc: {transaction.senderAccount}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.recipientName}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {transaction.recipientBank}, {transaction.recipientCountry}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-100 text-navy-800">
                          {transaction.method}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {transaction.status === 'pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleVerify(transaction.id)}
                                className="h-8 px-2 text-success-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleReject(transaction.id)}
                                className="h-8 px-2 text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(transaction)}
                            className="h-8 px-2 text-navy-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <File className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
              <p className="text-sm text-gray-500">
                {filterStatus 
                  ? `No ${filterStatus} transactions match your search.` 
                  : 'No transactions match your search.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Transaction Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-navy-50/50 border border-navy-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Transaction Summary</h3>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p className="font-mono font-medium">{selectedTransaction.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(selectedTransaction.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">{formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="font-medium">{selectedTransaction.method}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Sender Information</h4>
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedTransaction.senderName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Number</p>
                        <p className="font-medium">{selectedTransaction.senderAccount}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Recipient Information</h4>
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedTransaction.recipientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bank</p>
                        <p className="font-medium">{selectedTransaction.recipientBank}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Country</p>
                        <p className="font-medium">{selectedTransaction.recipientCountry}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">SWIFT/BIC Code</p>
                        <p className="font-medium">{selectedTransaction.recipientSwift}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedTransaction.status === 'pending' && (
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleReject(selectedTransaction.id);
                      setIsDetailsDialogOpen(false);
                    }}
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Transaction
                  </Button>
                  <Button
                    onClick={() => {
                      handleVerify(selectedTransaction.id);
                      setIsDetailsDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Transaction
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Submit to SWIFT Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Payments to SWIFT</DialogTitle>
            <DialogDescription>
              You are about to submit {verifiedCount} verified payment(s) to the SWIFT network for processing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mr-2" />
              <div>
                <h4 className="font-medium text-amber-800">Important Notice</h4>
                <p className="text-sm text-amber-700">
                  Once submitted, these transactions cannot be recalled. Please ensure all details
                  are correct before proceeding. This action is final.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubmitDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={processSubmitToSwift}
              disabled={isLoading}
              className="bg-navy-600 hover:bg-navy-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Confirm Submission
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificationPortal;
