
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Check,
  DollarSign,
  Building,
  MapPin,
  Globe,
  User,
  RefreshCw,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { addTransaction } from '@/services/transactionService';

// Mock exchange rates
const exchangeRates = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.82,
  JPY: 150.23,
  CAD: 1.37,
  AUD: 1.54,
  CHF: 0.9,
  ZAR: 18.65, // Added South African Rand
};

// Mock supported countries
const countries = [
  'Australia',
  'Canada',
  'China',
  'France',
  'Germany',
  'Italy',
  'Japan',
  'Mexico',
  'Spain',
  'United Kingdom',
  'United States',
  // Add more countries as needed
];

const PaymentForm: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState('ZAR'); // Changed default to ZAR
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [paymentMethod, setPaymentMethod] = useState('SWIFT');
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
  const [fee, setFee] = useState<number | null>(null);
  
  // Recipient details
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
  const [recipientBankName, setRecipientBankName] = useState('');
  const [recipientSwiftCode, setRecipientSwiftCode] = useState('');
  const [recipientCountry, setRecipientCountry] = useState('');
  const [recipientCity, setRecipientCity] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calculate converted amount
  const calculateAmount = () => {
    setIsCalculating(true);
    
    // Clear previous errors
    setErrors({});
    
    // Validate amount
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErrors(prev => ({ ...prev, amount: 'Please enter a valid amount' }));
      setIsCalculating(false);
      return;
    }
    
    // Simulate API call delay
    setTimeout(() => {
      const baseAmount = parseFloat(amount);
      const conversionRate = exchangeRates[targetCurrency as keyof typeof exchangeRates] / 
                            exchangeRates[sourceCurrency as keyof typeof exchangeRates];
      
      const converted = baseAmount * conversionRate;
      
      // Calculate fee (for example, 1% of the amount with a minimum of $5)
      const calculatedFee = Math.max(5, baseAmount * 0.01);
      
      setCalculatedAmount(converted);
      setFee(calculatedFee);
      setIsCalculating(false);
    }, 800);
  };
  
  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      }
      if (!sourceCurrency) {
        newErrors.sourceCurrency = 'Please select source currency';
      }
      if (!targetCurrency) {
        newErrors.targetCurrency = 'Please select target currency';
      }
      if (!paymentMethod) {
        newErrors.paymentMethod = 'Please select payment method';
      }
      if (calculatedAmount === null) {
        newErrors.calculated = 'Please calculate the conversion';
      }
    }
    
    if (step === 2) {
      if (!recipientName) {
        newErrors.recipientName = 'Recipient name is required';
      }
      if (!recipientAccountNumber) {
        newErrors.recipientAccountNumber = 'Account number is required';
      }
      if (!recipientBankName) {
        newErrors.recipientBankName = 'Bank name is required';
      }
      if (!recipientSwiftCode) {
        newErrors.recipientSwiftCode = 'SWIFT/BIC code is required';
      }
      if (!recipientCountry) {
        newErrors.recipientCountry = 'Country is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(current => current + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(current => current - 1);
    window.scrollTo(0, 0);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);

    const transactionData = {
      amount: parseFloat(amount),
      sourceCurrency,
      targetCurrency,
      paymentMethod,
      recipientName,
      recipientAccountNumber,
      recipientBankName,
      recipientSwiftCode,
      recipientCountry,
      recipientCity,
      recipientAddress,
      calculatedAmount
    }

    try {
      // Call the service to add the transaction
      await addTransaction(transactionData);
      toast.success('Payment submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment. Please try again.');
      return;
    } finally {
      setIsSubmitting(false);
    }
    
    // Simulate API call
    // setTimeout(() => {
    //   setIsSubmitting(false);
    //   toast.success('Payment submitted successfully!');
    //   navigate('/dashboard');
    // }, 2000);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Steps indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {[1, 2, 3].map(step => (
            <div 
              key={step}
              className={cn(
                "z-10 flex items-center justify-center rounded-full transition-all relative",
                step < currentStep 
                  ? "bg-navy-500 text-white w-10 h-10"
                  : step === currentStep
                  ? "bg-navy-500 text-white w-10 h-10 ring-4 ring-navy-100"
                  : "bg-white border border-gray-300 text-gray-500 w-8 h-8"
              )}
            >
              {step < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{step}</span>
              )}
              
              <div className="absolute -bottom-6 whitespace-nowrap text-sm font-medium">
                {step === 1 && 'Payment Details'}
                {step === 2 && 'Recipient Information'}
                {step === 3 && 'Confirmation'}
              </div>
            </div>
          ))}
          
          {/* Progress bar */}
          <div className="absolute top-1/2 h-[2px] w-full bg-gray-200 -translate-y-1/2 -z-0">
            <div 
              className="h-full bg-navy-500 transition-all"
              style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
            />
          </div>
        </div>
      </div>
      
      {/* Step 1: Payment Details */}
      {currentStep === 1 && (
        <Card className="glass-panel border-white/20 shadow-glass animate-fade-in">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Enter the amount and select currencies for your international transfer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Send</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      id="amount"
                      type="text"
                      placeholder="Enter amount"
                      className="pl-10 input-field"
                      value={amount}
                      onChange={(e) => {
                        // Only allow numbers and decimals
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setAmount(value);
                        setCalculatedAmount(null);
                      }}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red-500 text-sm">{errors.amount}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Source Currency</Label>
                  <Select 
                    value={sourceCurrency} 
                    onValueChange={(value) => {
                      setSourceCurrency(value);
                      setCalculatedAmount(null);
                    }}
                  >
                    <SelectTrigger className="input-field">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(exchangeRates).map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sourceCurrency && (
                    <p className="text-red-500 text-sm">{errors.sourceCurrency}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Target Currency</Label>
                  <Select 
                    value={targetCurrency} 
                    onValueChange={(value) => {
                      setTargetCurrency(value);
                      setCalculatedAmount(null);
                    }}
                  >
                    <SelectTrigger className="input-field">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(exchangeRates).map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.targetCurrency && (
                    <p className="text-red-500 text-sm">{errors.targetCurrency}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Tabs 
                    defaultValue={paymentMethod} 
                    onValueChange={setPaymentMethod}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-2">
                      <TabsTrigger value="SWIFT">SWIFT</TabsTrigger>
                      <TabsTrigger value="ACH">ACH</TabsTrigger>
                    </TabsList>
                    <TabsContent value="SWIFT" className="mt-0">
                      <div className="text-sm text-muted-foreground">
                        Society for Worldwide Interbank Financial Telecommunications. 
                        Fast international transfers with global coverage.
                      </div>
                    </TabsContent>
                    <TabsContent value="ACH" className="mt-0">
                      <div className="text-sm text-muted-foreground">
                        Automated Clearing House. More cost-effective but can be 
                        slower than SWIFT for some destinations.
                      </div>
                    </TabsContent>
                  </Tabs>
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm">{errors.paymentMethod}</p>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={calculateAmount} 
                  variant="outline" 
                  className="w-full"
                  disabled={isCalculating || !amount || !sourceCurrency || !targetCurrency}
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Calculate Conversion
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Conversion Result */}
            {calculatedAmount !== null && fee !== null && (
              <Card className="bg-navy-50/50 border border-navy-100">
                <CardHeader className="py-4 px-6">
                  <CardTitle className="text-lg">Conversion Summary</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-6 pb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You send:</span>
                      <span className="font-medium">{Number(amount).toLocaleString()} {sourceCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conversion rate:</span>
                      <span className="font-medium">
                        1 {sourceCurrency} = {(exchangeRates[targetCurrency as keyof typeof exchangeRates] / 
                        exchangeRates[sourceCurrency as keyof typeof exchangeRates]).toFixed(4)} {targetCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee:</span>
                      <span className="font-medium">{fee.toLocaleString()} {sourceCurrency}</span>
                    </div>
                    <div className="border-t border-navy-100 my-2 pt-2 flex justify-between text-lg">
                      <span className="font-medium">Recipient gets:</span>
                      <span className="font-bold text-navy-700">{calculatedAmount.toLocaleString()} {targetCurrency}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {errors.calculated && !calculatedAmount && (
              <p className="text-amber-600 text-sm flex items-center">
                <Info className="h-4 w-4 mr-1" />
                {errors.calculated}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleNextStep}
              className="btn-primary"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Step 2: Recipient Information */}
      {currentStep === 2 && (
        <Card className="glass-panel border-white/20 shadow-glass animate-fade-in">
          <CardHeader>
            <CardTitle>Recipient Information</CardTitle>
            <CardDescription>
              Enter the recipient's banking details for your transfer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    id="recipientName"
                    type="text"
                    placeholder="Enter recipient's full name"
                    className="pl-10 input-field"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                {errors.recipientName && (
                  <p className="text-red-500 text-sm">{errors.recipientName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipientAccountNumber">Account Number / IBAN</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    id="recipientAccountNumber"
                    type="text"
                    placeholder="Enter account number or IBAN"
                    className="pl-10 input-field"
                    value={recipientAccountNumber}
                    onChange={(e) => setRecipientAccountNumber(e.target.value)}
                  />
                </div>
                {errors.recipientAccountNumber && (
                  <p className="text-red-500 text-sm">{errors.recipientAccountNumber}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="recipientBankName">Bank Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    id="recipientBankName"
                    type="text"
                    placeholder="Enter bank name"
                    className="pl-10 input-field"
                    value={recipientBankName}
                    onChange={(e) => setRecipientBankName(e.target.value)}
                  />
                </div>
                {errors.recipientBankName && (
                  <p className="text-red-500 text-sm">{errors.recipientBankName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipientSwiftCode">SWIFT/BIC Code</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    id="recipientSwiftCode"
                    type="text"
                    placeholder="Enter SWIFT/BIC code"
                    className="pl-10 input-field"
                    value={recipientSwiftCode}
                    onChange={(e) => setRecipientSwiftCode(e.target.value)}
                  />
                </div>
                {errors.recipientSwiftCode && (
                  <p className="text-red-500 text-sm">{errors.recipientSwiftCode}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="recipientCountry">Country</Label>
                <Select 
                  value={recipientCountry} 
                  onValueChange={setRecipientCountry}
                >
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.recipientCountry && (
                  <p className="text-red-500 text-sm">{errors.recipientCountry}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipientCity">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    id="recipientCity"
                    type="text"
                    placeholder="Enter city"
                    className="pl-10 input-field"
                    value={recipientCity}
                    onChange={(e) => setRecipientCity(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipientAddress">Address (Optional)</Label>
              <Input
                id="recipientAddress"
                type="text"
                placeholder="Enter address"
                className="input-field"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              className="btn-secondary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleNextStep}
              className="btn-primary"
            >
              Review Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Step 3: Confirmation */}
      {currentStep === 3 && calculatedAmount !== null && fee !== null && (
        <Card className="glass-panel border-white/20 shadow-glass animate-fade-in">
          <CardHeader>
            <CardTitle>Confirm Your Payment</CardTitle>
            <CardDescription>
              Please review all details before confirming your international transfer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Summary */}
            <div className="bg-navy-50/50 border border-navy-100 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Transaction Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">You're sending</p>
                  <p className="text-xl font-semibold">{Number(amount).toLocaleString()} {sourceCurrency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recipient gets</p>
                  <p className="text-xl font-semibold">{calculatedAmount.toLocaleString()} {targetCurrency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fee</p>
                  <p className="font-medium">{fee.toLocaleString()} {sourceCurrency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{paymentMethod}</p>
                </div>
              </div>
            </div>
            
            {/* Recipient Information */}
            <div>
              <h3 className="text-lg font-medium mb-3">Recipient Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{recipientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Number / IBAN</p>
                  <p className="font-medium">{recipientAccountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{recipientBankName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SWIFT/BIC Code</p>
                  <p className="font-medium">{recipientSwiftCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {recipientCity && `${recipientCity}, `}{recipientCountry}
                  </p>
                </div>
                {recipientAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{recipientAddress}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Important Information</h4>
                  <p className="text-sm text-amber-700">
                    By confirming this payment, you authorize Global Pay to process this international
                    transfer according to the details provided. Transfers typically process within
                    1-3 business days depending on the destination country and payment method.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleSubmit}
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Payment
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default PaymentForm;
