import React, { useState, useEffect } from 'react';
import Hero3D from '../components/Hero3D';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { 
  Heart, CreditCard, ArrowRight, Share2, 
  MapPin, Globe, Shield, Wallet, Landmark,
  CheckCircle2, Loader2, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, doc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// Dummy static values while Firebase is initialized or if empty
const FALLBACK_CAMPAIGNS = [
  { id: 'education', title: 'Education Fund', raisedAmount: 15400, goal: 50000, icon: '📚' },
  { id: 'healthcare', title: 'Healthcare Access', raisedAmount: 22000, goal: 30000, icon: '🏥' },
  { id: 'water', title: 'Clean Water', raisedAmount: 8500, goal: 15000, icon: '💧' },
  { id: 'relief', title: 'Crisis Relief', raisedAmount: 43000, goal: 100000, icon: '🆘' },
];

const donationSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least $1'),
  frequency: z.enum(['one-time', 'monthly']),
  donorName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  message: z.string().max(200).optional(),
  isAnonymous: z.boolean().default(false),
  causeId: z.string().min(1, 'Please select a cause'),
  paymentMethod: z.enum(['card', 'upi', 'bank', 'paypal'])
});

const CARD_DATA = [
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'upi', label: 'UPI', icon: Wallet },
  { value: 'bank', label: 'Bank Transfer', icon: Landmark },
  { value: 'paypal', label: 'PayPal', icon: Globe },
];

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function Donate() {
  const [campaigns, setCampaigns] = useState(FALLBACK_CAMPAIGNS);
  const [donors, setDonors] = useState([]);
  const [selectedCause, setSelectedCause] = useState('general');
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: 50,
      frequency: 'one-time',
      isAnonymous: false,
      causeId: 'general',
      paymentMethod: 'card'
    }
  });

  const amount = watch('amount');
  const frequency = watch('frequency');
  const paymentMethod = watch('paymentMethod');

  // Fetch campaigns and recent donors
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsRef = collection(db, 'campaigns');
        const q = query(campaignsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const fetchdCamps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCampaigns(fetchdCamps.filter(c => c.isActive !== false));
        }
      } catch (err) {
        console.error('Error fetching campaigns', err);
      }
    };
    fetchCampaigns();

    const donorsRef = collection(db, 'donations');
    const qDonors = query(donorsRef, orderBy('createdAt', 'desc'), limit(10));
    const unsub = onSnapshot(qDonors, (snapshot) => {
      const recent = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isAnonymous) {
          recent.push({ id: doc.id, ...data });
        }
      });
      setDonors(recent);
    });

    return () => unsub();
  }, []);

  const handleAmountSelect = (val) => {
    setCustomAmount('');
    setValue('amount', val);
  };

  const handleCustomAmountChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    if (val && !isNaN(val)) {
      setValue('amount', Number(val));
    }
  };

  const handleCauseSelect = (id) => {
    setSelectedCause(id);
    setValue('causeId', id);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const donationId = `DON-${Math.floor(100000 + Math.random() * 900000)}`;
      const causeName = data.causeId === 'general' 
        ? 'General Fund' 
        : campaigns.find(c => c.id === data.causeId)?.title || data.causeId;

      const donationData = {
        ...data,
        causeName,
        donationId,
        status: 'pending', // pending admin ack
        acknowledgedByAdmin: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'donations'), donationData);

      // Increment campaign if not general
      if (data.causeId !== 'general') {
        try {
          const cRef = doc(db, 'campaigns', data.causeId);
          await updateDoc(cRef, {
            raisedAmount: increment(data.amount)
          });
        } catch (e) {
          // Campaign might not exist in db dynamically yet, ignore error
        }
      }

      setSuccessData({
        donationId,
        amount: data.amount,
        cause: causeName,
        name: data.donorName,
        email: data.email
      });
      
      toast.success('Donation processed successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-bg pt-24 pb-12 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>
          
          <h2 className="text-3xl font-serif font-bold text-primary mb-2">Thank you, {successData.name}!</h2>
          <p className="text-gray-600 mb-6 font-medium">
            Your generous gift changes lives.
          </p>
          
          <div className="bg-bg p-6 rounded-xl mb-8 text-left space-y-3">
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500">Amount:</span>
              <span className="font-bold text-primary">${successData.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-3">
              <span className="text-gray-500">Supported Cause:</span>
              <span className="font-medium text-gray-800">{successData.cause}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-500">Reference:</span>
              <span className="font-mono text-sm">{successData.donationId}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-8">
            A confirmation email has been sent to {successData.email}.
            Our team will acknowledge your donation shortly.
          </p>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Share your impact!</h4>
            <div className="flex justify-center gap-4">
              <button className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </button>
              <button className="p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <Link 
            to="/"
            className="mt-8 block w-full py-4 border-2 border-primary text-primary rounded-xl font-medium hover:bg-primary hover:text-white transition-colors"
          >
            Return to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[#0a2e24] to-[#0d3b2e] py-20 px-6 text-white text-center">
        <Hero3D />

        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-[pulse_10s_ease-in-out_infinite]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-black mb-6"
          >
            Your Gift Changes Lives
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-200 mb-12 font-light"
          >
            100% of your donation goes directly to our programs
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Raised', value: '$2.4M' },
              { label: 'Donors', value: '847' },
              { label: 'Active Campaigns', value: '12' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <div className="text-3xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-sm uppercase tracking-wider text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column - Cause Selection */}
          <div className="w-full lg:w-5/12 space-y-6">
            <h3 className="text-2xl font-serif font-bold text-primary mb-6">1. Choose a Cause</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* General Fund Card */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => handleCauseSelect('general')}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                  selectedCause === 'general' 
                    ? 'border-accent bg-accent/5' 
                    : 'border-transparent bg-white shadow-md hover:shadow-lg'
                }`}
              >
                <div className="text-3xl mb-3">🌍</div>
                <h4 className="font-bold text-gray-900 mb-2">General Fund</h4>
                <p className="text-sm text-gray-500">Allocate where it's needed most.</p>
              </motion.div>

              {campaigns.map((cause) => {
                const progress = Math.min(100, (cause.raisedAmount / cause.goal) * 100);
                return (
                  <motion.div
                    key={cause.id}
                    whileHover={{ y: -2 }}
                    onClick={() => handleCauseSelect(cause.id)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                      selectedCause === cause.id 
                        ? 'border-accent bg-accent/5' 
                        : 'border-transparent bg-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-3xl">{cause.icon || '🎗️'}</div>
                      <Shield className={`w-5 h-5 ${selectedCause === cause.id ? 'text-accent' : 'text-gray-300'}`} />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">{cause.title}</h4>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>${cause.raisedAmount?.toLocaleString() || 0}</span>
                        <span>Goal: ${cause.goal?.toLocaleString() || 0}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-accent"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Impact Section */}
            <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h4 className="font-serif font-bold text-xl mb-6">Where Your Money Goes</h4>
              
              <div className="flex items-center gap-8">
                {/* CSS Donut Chart */}
                <div className="relative w-32 h-32 rounded-full hidden sm:block" style={{
                  background: 'conic-gradient(var(--color-primary) 0% 70%, var(--color-accent) 70% 90%, #e2e8f0 90% 100%)'
                }}>
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-primary"></div>
                    <div className="flex-1 text-sm"><span className="font-bold">70%</span> Direct Programs</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-accent"></div>
                    <div className="flex-1 text-sm"><span className="font-bold">20%</span> Operations</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-slate-200"></div>
                    <div className="flex-1 text-sm"><span className="font-bold">10%</span> Emergency Reserve</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Donors Wall */}
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-accent" /> Recent Donors
              </h4>
              <div className="space-y-4">
                {donors.length === 0 ? (
                  <p className="text-gray-500 text-sm">Be the first to donate today!</p>
                ) : (
                  donors.map(donor => (
                    <div key={donor.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-sm">
                          {donor.donorName.split(' ')[0]} {donor.donorName.split(' ')[1]?.[0] || ''}.
                        </div>
                        <div className="text-xs text-gray-500">{donor.causeName}</div>
                      </div>
                      <div className="font-bold text-primary">${donor.amount}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
          
          {/* Right Column - Form */}
          <div className="w-full lg:w-7/12">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              
              {/* Step 1: Amount */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-serif font-bold text-primary">2. Select Amount</h3>
                  
                  {/* Frequency Toggle */}
                  <div className="flex bg-gray-100 rounded-full p-1">
                    <button
                      type="button"
                      onClick={() => setValue('frequency', 'one-time')}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        frequency === 'one-time' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      One-Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('frequency', 'monthly')}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        frequency === 'monthly' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                  {PRESET_AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountSelect(amt)}
                      className={`py-3 rounded-xl font-bold transition-all border-2 ${
                        amount === amt && !customAmount
                          ? 'border-accent bg-accent text-white'
                          : 'border-gray-100 text-gray-700 hover:border-accent hover:text-accent'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Custom Amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  />
                </div>
                {errors.amount && <p className="text-red-500 text-sm mt-2">{errors.amount.message}</p>}
                {errors.causeId && <p className="text-red-500 text-sm mt-2">{errors.causeId.message}</p>}
              </div>

              {/* Step 2: Details */}
              <div className="mb-10">
                <h3 className="text-2xl font-serif font-bold text-primary mb-6">3. Your Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        {...register('donorName')}
                        placeholder="Full Name *"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {errors.donorName && <p className="text-red-500 text-sm mt-1">{errors.donorName.message}</p>}
                    </div>
                    <div>
                      <input
                        {...register('email')}
                        placeholder="Email Address *"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        {...register('phone')}
                        placeholder="Phone Number (Optional)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <select
                        {...register('country')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent bg-white appearance-none"
                      >
                        <option value="">Select Country *</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                        <option value="IN">India</option>
                        <option value="OT">Other</option>
                      </select>
                      {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                    </div>
                  </div>

                  <textarea
                    {...register('message')}
                    placeholder="Leave a message or dedication (Optional)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  ></textarea>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        {...register('isAnonymous')}
                        className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer"
                      />
                    </div>
                    <span className="text-gray-600 text-sm group-hover:text-gray-900 transition-colors">
                      Make this donation anonymous
                    </span>
                  </label>
                </div>
              </div>

              {/* Step 3: Payment */}
              <div className="mb-10">
                <h3 className="text-2xl font-serif font-bold text-primary mb-6">4. Payment Method</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {CARD_DATA.map(method => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setValue('paymentMethod', method.value)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === method.value
                          ? 'border-accent bg-accent/5'
                          : 'border-gray-100 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <method.icon className={`w-6 h-6 mb-2 ${paymentMethod === method.value ? 'text-accent' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${paymentMethod === method.value ? 'text-accent' : 'text-gray-600'}`}>
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Conditional Payment UI (Simulation) */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                        <span className="text-sm font-bold text-gray-700">Secure Card Payment</span>
                        <div className="flex gap-1 text-gray-400">
                          <Shield className="w-5 h-5" />
                        </div>
                      </div>
                      <input placeholder="Name on Card" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent" />
                      <input placeholder="Card Number" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent" />
                      <div className="grid grid-cols-2 gap-4">
                        <input placeholder="MM/YY" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent" />
                        <input placeholder="CVC" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent" />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="text-center py-6">
                       <div className="w-40 h-40 bg-white border-2 border-dashed border-gray-300 rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">QR Placeholder</span>
                       </div>
                       <input placeholder="Enter UPI ID (e.g., name@upi)" className="w-full max-w-sm px-4 py-3 rounded-lg border border-gray-300 mx-auto block focus:ring-2 focus:ring-accent" />
                    </div>
                  )}

                  {paymentMethod === 'bank' && (
                    <div className="space-y-4 text-sm">
                      <h4 className="font-bold text-gray-800">Our Bank Details:</h4>
                      <div className="grid grid-cols-2 gap-2">
                         <span className="text-gray-500">Account Name:</span>
                         <span className="font-bold">HopeBridge NGO</span>
                         <span className="text-gray-500">Account No:</span>
                         <span className="font-mono">8192301923812</span>
                         <span className="text-gray-500">IFSC / SWIFT:</span>
                         <span className="font-mono">HOPB000123</span>
                         <span className="text-gray-500">Bank Name:</span>
                         <span className="font-medium">Global Citizen Bank</span>
                      </div>
                      <p className="text-xs text-orange-600 bg-orange-50 p-3 rounded mt-4">
                        Please initiate the transfer before submitting this form. We will verify your transaction manually.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="text-center py-8">
                       <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                       <p className="font-medium text-gray-800">You will be redirected to PayPal securely.</p>
                       <p className="text-sm text-gray-500 mt-2">Click submit below to continue.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !amount}
                className="w-full py-4 bg-accent hover:bg-yellow-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Donation <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <div className="text-center mt-6 text-xs text-gray-400 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Secure SSL Encrypted Transaction
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
