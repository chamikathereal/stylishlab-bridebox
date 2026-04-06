import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { SaleResponse } from '@/api/generated/model';

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontFamily: 'Helvetica', 
    fontSize: 12, 
    color: '#333' 
  },
  header: { 
    marginBottom: 30, 
    paddingBottom: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: 10, 
    color: '#666', 
    marginBottom: 2 
  },
  section: { 
    marginBottom: 20 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 5 
  },
  label: { 
    fontSize: 10, 
    color: '#666' 
  },
  value: { 
    fontSize: 12, 
    fontWeight: 'normal' 
  },
  boldValue: { 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  table: { 
    marginTop: 20, 
    marginBottom: 20 
  },
  tableHeader: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    paddingBottom: 5, 
    marginBottom: 10 
  },
  tableRow: { 
    flexDirection: 'row', 
    marginBottom: 5 
  },
  col1: { width: '60%' },
  col2: { width: '40%', textAlign: 'right' },
  totalSection: { 
    marginTop: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    paddingTop: 10 
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginBottom: 5 
  },
  totalLabel: { 
    width: 100, 
    textAlign: 'right', 
    marginRight: 20, 
    color: '#666' 
  },
  totalValue: { 
    width: 80, 
    textAlign: 'right', 
    fontWeight: 'bold' 
  },
  footer: { 
    position: 'absolute', 
    bottom: 40, 
    left: 40, 
    right: 40, 
    textAlign: 'center', 
    color: '#888', 
    fontSize: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    paddingTop: 10 
  },
});

export interface ReceiptPDFProps {
  sale: SaleResponse;
}

export function ReceiptPDF({ sale }: ReceiptPDFProps) {
  const formatCurrency = (val?: number) => `Rs. ${(val ?? 0).toLocaleString()}`;
  const formatDate = (d?: string) => d ? new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '-';

  return (
    <Document title={`stylish-lab-${sale.invoiceNo}`}>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>STYLISH LAB</Text>
          <Text style={styles.subtitle}>Bridebox Salon Management</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Invoice No</Text>
              <Text style={styles.value}>{sale.invoiceNo}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formatDate(sale.createdAt)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Customer Details</Text>
          <Text style={styles.boldValue}>{sale.customerName || 'Walk-in Customer'}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.label]}>Service Description</Text>
            <Text style={[styles.col2, styles.label]}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.col1}>{sale.serviceNameSnapshot}</Text>
            <Text style={styles.col2}>{formatCurrency(sale.servicePriceSnapshot)}</Text>
          </View>
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(sale.servicePriceSnapshot)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Paid Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(sale.paidAmount)}</Text>
          </View>
          {sale.dueAmount && sale.dueAmount > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Amount Due:</Text>
              <Text style={styles.totalValue}>{formatCurrency(sale.dueAmount)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Payment Status</Text>
          <Text style={styles.boldValue}>{sale.paymentStatus}</Text>
          <Text style={[styles.label, { marginTop: 10 }]}>Served By</Text>
          <Text style={styles.value}>{sale.employeeName}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for choosing Stylish Lab!</Text>
        </View>
      </Page>
    </Document>
  );
}
