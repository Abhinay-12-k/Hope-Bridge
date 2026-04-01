import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Send, CheckCircle, Loader2, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function Contact() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data) => {
    try {
      await addDoc(collection(db, 'contacts'), {
        ...data,
        createdAt: serverTimestamp(),
        replied: false
      });
      setIsSuccess(true);
      reset();
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <SEOHead title="Contact Us" description="Have questions? Want to collaborate? Reach out to HopeBridge NGO and let's make a difference together." />

      {/* --- HERO SECTION --- */}
      <section className="bg-primary pt-48 pb-32 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
           <MessageSquare size={400} className="absolute -bottom-20 -right-20 text-white" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl md:text-8xl font-black text-white mb-6 uppercase tracking-tight">
            Get in <span className="text-accent italic font-serif lowercase">Touch</span>
          </motion.h1>
          <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Whether you have a question, a proposal, or just want to say hello, we're here for you.
          </p>
        </div>
      </section>

      <section className="py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* --- LEFT SIDE: INFO --- */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-8">
              <div className="space-y-4">
                <span className="text-accent font-bold uppercase tracking-widest text-xs">Reach Out</span>
                <h2 className="text-4xl font-serif italic font-black text-primary">Our Headquarters</h2>
              </div>
              <div className="grid gap-6">
                {[
                  { icon: MapPin, title: "Visit Us", content: "Police Headquarters Street, Anantapur", color: "bg-blue-50 text-blue-600" },
                  { icon: Phone, title: "Call Us", content: "+91 98765 43210", color: "bg-emerald-50 text-emerald-600" },
                  { icon: Mail, title: "Email Us", content: "anantapurpolice@gmail.com", color: "bg-accent/5 text-accent" }
                ].map((item, i) => (
                  <motion.div key={i} whileHover={{ x: 10 }} className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}><item.icon size={24} /></div>
                    <div><h4 className="text-xs font-black uppercase text-primary/40 mb-1 tracking-widest">{item.title}</h4><p className="text-primary font-bold">{item.content}</p></div>
                  </motion.div>
                ))}
              </div>
              <div className="h-80 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-700">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123847.67493208035!2d77.51860017124115!3d14.67503704256214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb14ab56434449b%3A0xe510f0896796c905!2sAnantapur%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1711964123456!5m2!1sen!2sin" width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy" title="Office Location" />
              </div>
              <div className="flex gap-4 pt-4">
                {[InstagramIcon, TwitterIcon, FacebookIcon].map((Icon, idx) => (
                   <a key={idx} href="#" className="w-12 h-12 rounded-full border border-gray-100 bg-white flex items-center justify-center text-primary/40 hover:text-accent hover:border-accent transition-all"><Icon size={20} width={20} height={20} /></a>
                ))}
              </div>
            </div>

            {/* --- RIGHT SIDE: FORM --- */}
            <div className="lg:col-span-12 xl:col-span-7 bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-primary/40 ml-4">Full Name</label>
                        <input {...register('name')} placeholder="John Doe" className={`w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-accent transition-all font-medium ${errors.name ? 'ring-2 ring-red-500' : ''}`} />
                        {errors.name && <p className="text-red-500 text-[10px] ml-4 font-bold uppercase">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-primary/40 ml-4">Email Address</label>
                        <input {...register('email')} placeholder="john@example.com" className={`w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-accent transition-all font-medium ${errors.email ? 'ring-2 ring-red-500' : ''}`} />
                        {errors.email && <p className="text-red-500 text-[10px] ml-4 font-bold uppercase">{errors.email.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-primary/40 ml-4">Subject</label>
                      <input {...register('subject')} placeholder="How can we help?" className={`w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-accent transition-all font-medium ${errors.subject ? 'ring-2 ring-red-500' : ''}`} />
                      {errors.subject && <p className="text-red-500 text-[10px] ml-4 font-bold uppercase">{errors.subject.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-primary/40 ml-4">Message</label>
                      <textarea {...register('message')} rows={6} placeholder="Your message here..." className={`w-full bg-bg border-none rounded-[2rem] py-6 px-8 text-sm focus:ring-2 focus:ring-accent transition-all font-medium resize-none ${errors.message ? 'ring-2 ring-red-500' : ''}`}></textarea>
                      {errors.message && <p className="text-red-500 text-[10px] ml-4 font-bold uppercase">{errors.message.message}</p>}
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-primary text-white font-bold py-5 rounded-full uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50">
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Send Message <Send size={16} /></>}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center space-y-8">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}><CheckCircle className="text-emerald-500 w-12 h-12" /></motion.div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-serif italic font-black text-primary">Message Sent!</h3>
                      <p className="text-text-muted max-w-sm mx-auto">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    </div>
                    <button onClick={() => setIsSuccess(false)} className="text-accent font-bold uppercase tracking-widest text-xs underline underline-offset-8 decoration-accent/30 hover:decoration-accent">Send another message</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
