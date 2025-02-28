import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserTransactions } from '@/services/transaction.service';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
};

const TRANSACTIONS_PER_PAGE = 5;

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
    });

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const result = await getUserTransactions(user.id, token);
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

    const startIndex = (pagination.currentPage - 1) * TRANSACTIONS_PER_PAGE;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + TRANSACTIONS_PER_PAGE);

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white">
                    <h1 className="text-xl font-semibold">Your Purchase History</h1>
                </div>

                <div className="p-6">
                    {isLoading && <p>Loading transactions...</p>}
                    {error && <p className="text-red-600">{error}</p>}

                    {!isLoading && !error && paginatedTransactions.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TransactionId</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedTransactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td className="px-6 py-4">{transaction.courseId.title}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="cursor-pointer text-indigo-600 hover:underline"
                                                    title="Click to copy"
                                                    onClick={() => navigator.clipboard.writeText(transaction.stripeSessionId)}
                                                >
                                                    {transaction.stripeSessionId.slice(0, 6)}...{transaction.stripeSessionId.slice(-4)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">{formatDate(transaction.createdAt)}</td>
                                            <td className="px-6 py-4">${transaction.paymentAmount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium 
                          ${transaction.status === 'success' ? 'bg-green-100 text-green-700' :
                                                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-6 space-x-2">
                            <button
                                className={`px-4 py-2 border ${pagination.currentPage === 1 ? 'text-gray-400' : 'text-indigo-600'}`}
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 border bg-gray-100">{pagination.currentPage} / {pagination.totalPages}</span>
                            <button
                                className={`px-4 py-2 border ${pagination.currentPage === pagination.totalPages ? 'text-gray-400' : 'text-indigo-600'}`}
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;
