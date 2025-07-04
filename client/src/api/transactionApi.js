
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      
      const token = getState().auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Transaction'],
  endpoints: (builder) => ({

    getTransactions: builder.query({
  query: (walletId) => `/transactions?walletId=${walletId}`,
  providesTags: ['Transaction'],
}),

    addTransaction: builder.mutation({
      query: (formData) => ({
        url: '/transactions',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Transaction'],
    }),
    updateTransaction: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/transactions/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Transaction'],
    }),
    deleteTransaction: builder.mutation({
  query: ({ id, walletId }) => ({
    url: `/transactions/${id}?walletId=${walletId}`,
    method: 'DELETE',
  }),
  invalidatesTags: ['Transaction'],
}),
  }),
});

export const {
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionApi;
