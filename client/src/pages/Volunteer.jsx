import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, Loader2, Sparkles, Heart, Globe, Search } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const volunteerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  city: z.string().min(2, "City/Country is required"),
  skills: z.string().min(10, "Tell us more about your skills"),
  motivation: z.string().min(20, "Tell us more about your motivation"),
  availability: z.string().min(1, "Select your availability"),
  source: z.string().min(1, "Tell us how you heard about us")
});

export default function Volunteer() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(volunteerSchema)
  });

  const onSubmit = async (data) => {
    try {
      await addDoc(collection(db, 'volunteers'), {
        ...data,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      reset();
      toast.success("Application received!");
    } catch (error) {
      console.error("Error saving volunteer:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <SEOHead title="Volunteer With Us" description="Join the HopeBridge movement. Apply to be a volunteer and help us make a difference in healthcare, education, and crisis relief." />

      {/* --- HERO SECTION --- */}
      <section className="bg-primary pt-48 pb-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
          <Heart size={400} className="text-white" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-8xl font-black text-white mb-6 uppercase tracking-tight">
            Join Our <span className="text-accent italic font-serif lowercase">Mission</span>
          </motion.h1>
          <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Your skills can create waves of change. Become a part of our global volunteer network.
          </p>
        </div>
      </section>

      <section className="py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* --- LEFT SIDE: THE PITCH --- */}
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-accent font-bold uppercase tracking-[0.2em] text-xs">The Volunteer Experience</span>
              <h2 className="text-4xl md:text-6xl font-serif italic text-primary leading-tight font-black">Making a <span className="text-accent">Tangible</span> Impact</h2>
              <p className="text-text-muted text-lg leading-relaxed">
                At HopeBridge, we don't just assign tasks; we empower individual talent. Whether you're a medical professional, a teacher, a logistical expert, or just someone with a heart for service, we have a place for you.
              </p>
            </div>

            <div className="grid gap-8">
              {[
                { icon: Globe, title: "Global Network", text: "Join 10,000+ change-makers across 15 countries." },
                { icon: Sparkles, title: "Skill Building", text: "Gain real-world experience in international development." },
                { icon: Heart, title: "Lasting Impact", text: "See the direct results of your dedication on the ground." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0">
                    <item.icon size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-primary mb-1 uppercase tracking-wide">{item.title}</h4>
                    <p className="text-text-muted text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT SIDE: FORM --- */}
          <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-primary/40 ml-4">Phone Number</label>
                        <input {...register('phone')} placeholder="+1 (234) 567" className={`w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-accent transition-all font-medium ${errors.phone ? 'ring-2 ring-red-500' : ''}`} />
                        {errors.phone && <p className="text-red-500 text-[10px] ml-4 font-bold uppercase">{errors.phone.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-primary/40 ml-4">City / Country</label>
                        <input {...register('city')} placeholder="Berlin, Germany" className={`w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-accent transition-all font-medium ${errors.city ? 'ring-2 ring-red-500' : ''}`} />
                        {errors.city && <p className="text-red-500 text-[10px] ml-4 font-bold uppercase">{errors.city.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-primary/40 ml-4">Skills / Expertise</label>
                      <textarea {...register('skills')} rows={3} placeholder="Medical care, teaching, web design..." className={`w-full bg-bg border-none rounded-[2rem] py-6 px-8 text-sm focus:ring-2 focus:ring-accent transition-all font-medium resize-none ${errors.skills ? 'ring-2 ring-red-500' : ''}`}></textarea>
                      {errors.skills && <p className="text-red-500 text-[10px] ml-4 font-bold uppercase">{errors.skills.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-primary/40 ml-4">Why HopeBridge?</label>
                      <textarea {...register('motivation')} rows={3} placeholder="Tell us your motivation..." className={`w-full bg-bg border-none rounded-[2rem] py-6 px-8 text-sm focus:ring-2 focus:ring-accent transition-all font-medium resize-none ${errors.motivation ? 'ring-2 ring-red-500' : ''}`}></textarea>
                      {errors.motivation && <p className="text-red-500 text-[10px] ml-4 font-bold uppercase">{errors.motivation.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-primary/40 ml-4">Availability</label>
                        <select {...register('availability')} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-accent transition-all font-medium appearance-none">
                           <option value="">Select Option</option>
                           <option value="Weekdays">Weekdays</option>
                           <option value="Weekends">Weekends</option>
                           <option value="Both">Both</option>
                           <option value="Full-time">Full-time</option>
                        </select>
                        {errors.availability && <p className="text-red-500 text-[10px] ml-4 font-bold uppercase">{errors.availability.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-primary/40 ml-4">Source</label>
                        <select {...register('source')} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-accent transition-all font-medium appearance-none">
                           <option value="">How'd you hear about us?</option>
                           <option value="Social Media">Social Media</option>
                           <option value="Search Engine">Search Engine</option>
                           <option value="Word of Mouth">Word of Mouth</option>
                           <option value="Event">Event</option>
                        </select>
                        {errors.source && <p className="text-red-500 text-[10px] ml-4 font-bold uppercase">{errors.source.message}</p>}
                      </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-primary text-white font-bold py-5 rounded-full uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 mt-4">
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Apply Now <Send size={16} /></>}
                    </button>
                </motion.form>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center space-y-8">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="text-emerald-500 w-12 h-12" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-serif italic text-primary font-black">Application Sent!</h3>
                    <p className="text-text-muted max-w-sm mx-auto">Thank you for applying. Our volunteer coordination team will review your application and be in touch within 48 hours.</p>
                  </div>
                  <button onClick={() => setIsSuccess(false)} className="text-accent font-bold uppercase tracking-widest text-xs underline underline-offset-8">Return to form</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}

const Send = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
