import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserTransactions } from '@/services/transaction.service';
import { ArrowLeft, ArrowRight, Copy, Receipt, AlertCircle } from 'lucide-react';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const TRANSACTIONS_PER_PAGE = 6;

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const { user, token } = useAuth();

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
    });

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const result = await getUserTransactions(token);
                if (result.success) {
                    setTransactions(result.data);
                    setPagination({
                        currentPage: 1,
                        totalPages: Math.ceil(result.data.length / TRANSACTIONS_PER_PAGE),
                    });
                    setError(null);
                }
            } catch (err) {
                setError('Failed to load transactions. Please try again later.');
                setTransactions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            setPagination({ ...pagination, currentPage: page });
        }
    };

    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const startIndex = (pagination.currentPage - 1) * TRANSACTIONS_PER_PAGE;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + TRANSACTIONS_PER_PAGE);

    const getStatusStyles = (status) => {
        switch (status.toLowerCase()) {
            case 'success':
                return 'bg-green-50 text-green-700 ring-green-600/20';
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
            default:
                return 'bg-red-50 text-red-700 ring-red-600/20';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Transaction History
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            View and manage your course purchase transactions
                        </p>
                    </div>
                </div>

                {paginatedTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No transactions</h3>
                        <p className="mt-1 text-sm text-gray-500">You haven't made any purchases yet.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Course</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Transaction ID</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedTransactions.map((transaction) => (
                                    <tr key={transaction._id} className="hover:bg-gray-50">
                                        <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="font-medium text-gray-900">{transaction.courseId.title}</div>
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-500">
                                            <button
                                                onClick={() => handleCopyId(transaction.stripeSessionId)}
                                                className="group inline-flex items-center space-x-1 text-gray-500 hover:text-gray-900"
                                            >
                                                <span>{transaction.stripeSessionId.slice(0, 6)}...{transaction.stripeSessionId.slice(-4)}</span>
                                                <Copy className={`h-4 w-4 ${copiedId === transaction.stripeSessionId ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                            </button>
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-500">
                                            {formatDate(transaction.createdAt)}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-900 font-medium">
                                            ₹{transaction.paymentAmount.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-4 text-sm">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusStyles(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(startIndex + TRANSACTIONS_PER_PAGE, transactions.length)}
                                            </span>{' '}
                                            of <span className="font-medium">{transactions.length}</span> transactions
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1}
                                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <ArrowLeft className="h-5 w-5" />
                                            </button>
                                            {[...Array(pagination.totalPages)].map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handlePageChange(idx + 1)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                        pagination.currentPage === idx + 1
                                                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Next</span>
                                                <ArrowRight className="h-5 w-5" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;