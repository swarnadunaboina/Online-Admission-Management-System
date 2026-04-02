'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Application, Payment } from '@/types';

const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'net_banking', label: 'Net Banking' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
];

export default function StudentPaymentPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState('');
  const [paymentType, setPaymentType] = useState('application_fee');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    Promise.all([
      api.applications.getMy().then((r) => setApplications((r.data as any).data || [])),
      api.payments.getMy().then((r) => setPayments((r.data as any).data || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const eligibleApps = applications.filter((a) =>
    ['submitted', 'under_review', 'eligible', 'accepted'].includes(a.status)
  );

  const getApplicationFee = () => {
    const app = eligibleApps.find((a) => a._id === selectedApp);
    if (!app) return 0;
    const prog = app.program as any;
    if (paymentType === 'application_fee') return prog?.fees?.applicationFee || 500;
    if (paymentType === 'tuition_fee') return prog?.fees?.tuitionFee || 50000;
    if (paymentType === 'registration_fee') return prog?.fees?.registrationFee || 1000;
    return 0;
  };

  const handleInitiatePayment = async () => {
    if (!selectedApp) { toast.error('Please select an application.'); return; }
    setProcessing(true);
    try {
      const amount = getApplicationFee();
      const res = await api.payments.initiate({
        application: selectedApp,
        type: paymentType,
        paymentMethod,
        amount,
        currency: 'INR',
      });
      const payment = (res.data as any).data;

      // Simulate immediate confirmation (real integration would redirect to gateway)
      await api.payments.confirm(payment._id, {
        transactionId: `TXN-${Date.now()}`,
        gatewayResponse: { status: 'success', mode: 'simulation' },
      });

      toast.success('Payment successful! Receipt generated.');
      const payRes = await api.payments.getMy();
      setPayments((payRes.data as any).data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Fee Payment</h1>
        <p className="text-gray-500 mt-1">Pay your admission or tuition fees online</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card title="Initiate Payment">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : eligibleApps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No eligible applications for payment.</p>
              <p className="text-xs text-gray-400 mt-1">Applications must be submitted and under review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Select
                label="Select Application"
                required
                options={[
                  { value: '', label: 'Choose application...' },
                  ...eligibleApps.map((a) => ({
                    value: a._id,
                    label: `${a.applicationNumber || a._id.slice(-6)} — ${(a.program as any)?.name || 'Program'}`,
                  })),
                ]}
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
              />

              <Select
                label="Payment Type"
                required
                options={[
                  { value: 'application_fee', label: 'Application Fee' },
                  { value: 'registration_fee', label: 'Registration Fee' },
                  { value: 'tuition_fee', label: 'Tuition Fee' },
                ]}
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              />

              <Select
                label="Payment Method"
                required
                options={PAYMENT_METHODS}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />

              {selectedApp && (
                <div className="bg-primary-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-700">Amount to Pay</span>
                    <span className="text-xl font-bold text-primary-900">
                      {formatCurrency(getApplicationFee())}
                    </span>
                  </div>
                  <p className="text-xs text-primary-500 mt-1">Includes all applicable taxes</p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                <strong>Note:</strong> This is a simulated payment gateway. No real transaction will occur.
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={processing}
                disabled={!selectedApp}
                leftIcon={<CreditCard className="w-4 h-4" />}
                className="w-full"
                onClick={handleInitiatePayment}
              >
                {processing ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          )}
        </Card>

        {/* Payment History */}
        <Card title="Payment History">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No payment records yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {payments.map((pay) => (
                <div key={pay._id} className="py-4 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    pay.status === 'completed' ? 'bg-green-50' : 'bg-gray-100'
                  }`}>
                    {pay.status === 'completed'
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <Clock className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 capitalize">
                        {pay.type?.replace(/_/g, ' ')}
                      </p>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(pay.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">
                        {pay.receiptNumber || pay.transactionId || 'N/A'} · {formatDate(pay.createdAt!)}
                      </p>
                      <Badge status={pay.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
