import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { PlusCircle, MinusCircle, DollarSign, Wallet, TrendingUp, TrendingDown, Trash2, CalendarDays, Loader2 } from 'lucide-react'; // Added Loader2 import
import { format, isValid } from 'date-fns';


const safeParseTimestamp = (timestampValue) => {
  if (!timestampValue) {
    return null;
  }
  if (typeof timestampValue === 'object' && timestampValue.seconds !== undefined) {
    const date = new Date(timestampValue.seconds * 1000);
    return isValid(date) ? date : null;
  }
  if (typeof timestampValue === 'string') {
    const date = new Date(timestampValue); // ISO string from backend
    return isValid(date) ? date : null;
  }
  if (timestampValue instanceof Date && isValid(timestampValue)) {
    return timestampValue;
  }
  return null;
};


const incomeCategories = ['Salary', 'Allowance', 'Scholarship', 'Freelance', 'Gift', 'Other Income'];
const expenseCategories = ['Food', 'Rent', 'Transport', 'Books', 'Tuition', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Other Expense'];


function FinanceTracker({ userId, userProfile, isAxiosAuthReady }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('expense'); 
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(format(new Date(), 'yyyy-MM-dd')); 
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId || !isAxiosAuthReady) {
        console.log('[FinanceTracker] Skipping fetchTransactions: userId or isAxiosAuthReady not ready.');
        return;
      }
      setLoading(true);
      console.log('[FinanceTracker] Attempting to fetch transactions from:', `${API_BASE_URL}/api/finance/transactions`);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/finance/transactions`);
        setTransactions(response.data);
        console.log('[FinanceTracker] Transactions fetched successfully.');
      } catch (error) {
        console.error('[FinanceTracker] Error fetching transactions:', error.response?.data || error.message);
        toast.error('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [userId, API_BASE_URL, isAxiosAuthReady]);

  // Handle new transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !category) {
      toast.error('Please fill in amount and category.');
      return;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error('Amount must be a positive number.');
      return;
    }
    if (!userId || !isAxiosAuthReady) {
      toast.error('Authentication required to add transaction.');
      return;
    }

    const payload = {
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: transactionDate, // Send as ISO string
    };

    console.log('[FinanceTracker] Sending add transaction request with payload:', payload);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/finance/transactions`, payload);
      setTransactions(prev => [response.data, ...prev]); // New transaction go to top
      toast.success('Transaction added successfully!');
      console.log('[FinanceTracker] Transaction added successfully:', response.data);

      // Reset
      setAmount('');
      setCategory('');
      setDescription('');
      setTransactionDate(format(new Date(), 'yyyy-MM-dd'));
    } catch (error) {
      console.error('[FinanceTracker] Error adding transaction:', error.response?.data || error.message);
      toast.error('Failed to add transaction: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    if (!userId || !isAxiosAuthReady) {
      toast.error('Authentication required to delete transaction.');
      return;
    }

    console.log(`[FinanceTracker] Attempting to delete transaction with ID: ${transactionId}`);
    try {
      await axios.delete(`${API_BASE_URL}/api/finance/transactions/${transactionId}`);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      toast.success('Transaction deleted successfully!');
      console.log(`[FinanceTracker] Transaction ${transactionId} deleted successfully.`);
    } catch (error) {
      console.error(`[FinanceTracker] Error deleting transaction ${transactionId}:`, error.response?.data || error.message);
      toast.error('Failed to delete transaction: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="flex-grow p-4 md:p-8 flex flex-col h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto flex flex-grow w-full bg-white rounded-xl shadow-custom-medium overflow-hidden">
        <div className="w-full flex flex-col p-4 md:p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-student-os-dark-gray mb-6">Finance Tracker</h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-100 p-4 rounded-lg shadow-sm flex items-center space-x-3">
              <TrendingUp size={24} className="text-green-600" />
              <div>
                <p className="text-sm text-green-700">Total Income</p>
                <p className="text-xl font-bold text-green-800">KSh {totalIncome.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg shadow-sm flex items-center space-x-3">
              <TrendingDown size={24} className="text-red-600" />
              <div>
                <p className="text-sm text-red-700">Total Expenses</p>
                <p className="text-xl font-bold text-red-800">KSh {totalExpenses.toFixed(2)}</p>
              </div>
            </div>
            <div className={`p-4 rounded-lg shadow-sm flex items-center space-x-3 ${netBalance >= 0 ? 'bg-blue-100' : 'bg-yellow-100'}`}>
              <Wallet size={24} className={`${netBalance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`} />
              <div>
                <p className={`text-sm ${netBalance >= 0 ? 'text-blue-700' : 'text-yellow-700'}`}>Net Balance</p>
                <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-blue-800' : 'text-yellow-800'}`}>KSh {netBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* New Transaction Form */}
          <div className="bg-student-os-light-gray p-5 rounded-lg shadow-sm mb-6">
            <h3 className="text-xl font-semibold text-student-os-dark-gray mb-4">Add New Transaction</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Type Selector */}
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="transactionType"
                    value="expense"
                    checked={type === 'expense'}
                    onChange={() => setType('expense')}
                    className="form-radio text-red-500 focus:ring-red-500"
                  />
                  <MinusCircle size={20} className="text-red-500" />
                  <span className="text-student-os-dark-gray">Expense</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="transactionType"
                    value="income"
                    checked={type === 'income'}
                    onChange={() => setType('income')}
                    className="form-radio text-green-500 focus:ring-green-500"
                  />
                  <PlusCircle size={20} className="text-green-500" />
                  <span className="text-student-os-dark-gray">Income</span>
                </label>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-student-os-dark-gray mb-1">Amount (KSh)</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 500.00"
                  step="0.01"
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-student-os-dark-gray mb-1">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors bg-white"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {(type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-student-os-dark-gray mb-1">Description (Optional)</label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Lunch at cafeteria"
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="transactionDate" className="block text-sm font-medium text-student-os-dark-gray mb-1">Date</label>
                <input
                  type="date"
                  id="transactionDate"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-student-os-accent text-black rounded-lg shadow-md hover:bg-student-os-accent/90 transition-colors flex items-center justify-center space-x-2"
              >
                <DollarSign size={20} />
                <span>Add Transaction</span>
              </button>
            </form>
          </div>

          {/* Transaction History */}
          <h3 className="text-xl font-bold text-student-os-dark-gray mt-8 mb-4">Transaction History</h3>
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 size={24} className="animate-spin text-student-os-accent" />
              <p className="ml-2 text-student-os-dark-gray">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-student-os-light-gray">No transactions yet. Add your first one!</p>
          ) : (
            <div className="space-y-3">
              {transactions.map(transaction => (
                <div key={transaction.id} className="bg-student-os-light-gray p-4 rounded-lg shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {transaction.type === 'income' ? (
                      <PlusCircle size={24} className="text-green-600" />
                    ) : (
                      <MinusCircle size={24} className="text-red-600" />
                    )}
                    <div>
                      <p className="font-semibold text-lg text-student-os-dark-gray">{transaction.category}</p>
                      {transaction.description && (
                        <p className="text-sm text-student-os-dark-gray italic">{transaction.description}</p>
                      )}
                      <p className="text-xs text-student-os-light-gray flex items-center space-x-1 mt-1">
                        <CalendarDays size={14} />
                        <span>{safeParseTimestamp(transaction.timestamp) ? format(safeParseTimestamp(transaction.timestamp), 'PPP') : 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold text-xl ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                      KSh {transaction.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="p-1 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                      aria-label={`Delete transaction ${transaction.category}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinanceTracker;
