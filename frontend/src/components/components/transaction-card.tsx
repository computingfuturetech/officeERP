import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from './ui/table';

const DailyTransactionDisplay = ({ heading, transactions }) => {
    return (
        <Card className="w-full">
            <CardHeader className='pb-2'>
                <CardTitle>{heading}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table className='w-full'>
                    <TableBody>
                        {transactions.map((transaction, index) => (
                            <TableRow key={index}>
                                <TableCell>{transaction.date}</TableCell>
                                <TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default DailyTransactionDisplay;