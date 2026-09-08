import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, CheckCircle2, Users, LayoutDashboard, Calendar, CalendarCheck, Settings, Bell, Search, MapPin, ChevronRight, Check, Lock, Target, Filter, ChevronLeft, PieChart, BarChart2 } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const [activeStep, setActiveStep] = useState('discover');

  // Simple intersection observer for reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="landing-page">
      {/* 1. HEADER */}
      <header className="landing-header">
        <div className="landing-container flex justify-between items-center h-full">
          <div className="landing-logo">
            <div className="logo-r">R</div>
            <div className="logo-text">
              <strong className="logo-wordmark">BS Enterprise</strong>
              <span className="logo-sub">esource Booking System</span>
            </div>
          </div>
          
          <nav className="landing-nav hidden-mobile">
            <a href="#home" className="nav-link active">Home</a>
            <a href="#resources" className="nav-link">Resources</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
          
          <div className="landing-auth-links">
            <Link to="/login" className="btn btn-outline">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      {/* 2. HERO */}
      <section id="home" className="landing-hero">
        <div className="landing-container hero-grid">
          <div className="hero-content reveal-on-scroll">
            <div className="hero-eyebrow">RESOURCE MANAGEMENT PLATFORM</div>
            <h1 className="hero-headline">
              Manage Your<br />
              <span className="text-teal">Resources.</span><br />
              Without The Chaos.
            </h1>
            <p className="hero-description">
              Discover, book and manage shared resources through one simple platform built for modern organizations.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
              <a href="#resources" className="btn btn-outline btn-lg">Explore Resources</a>
            </div>
            
            <div className="hero-trust">
              <div className="trust-item">
                <Shield className="trust-icon" size={16} />
                <span>Trusted by organizations</span>
              </div>
              <div className="trust-item">
                <Shield className="trust-icon" size={16} />
                <span>Secure & reliable</span>
              </div>
              <div className="trust-item">
                <Users className="trust-icon" size={16} />
                <span>Loved by users</span>
              </div>
            </div>
          </div>
          
          <div className="hero-visual reveal-on-scroll">
            <div className="hero-image-wrapper">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" alt="Modern corporate office" className="hero-image" />
              
              {/* Card 1 */}
              <div className="status-card card-1">
                <div className="sc-icon bg-teal-light"><LayoutDashboard size={16} /></div>
                <div className="sc-info">
                  <strong>Meeting Room A</strong>
                  <span className="sc-status text-teal"><span className="status-dot bg-teal"></span>Available</span>
                  <span className="sc-time">09:00 AM – 10:00 AM</span>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="status-card card-2">
                <div className="sc-icon bg-orange-light"><Users size={16} /></div>
                <div className="sc-info">
                  <strong>Conference Room B</strong>
                  <span className="sc-status text-orange"><span className="status-dot bg-orange"></span>Booked</span>
                  <span className="sc-time">11:00 AM – 12:00 PM</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="status-card card-3">
                <div className="sc-icon bg-teal-light"><CheckCircle2 size={16} /></div>
                <div className="sc-info">
                  <strong>Training Room</strong>
                  <span className="sc-status text-teal"><span className="status-dot bg-teal"></span>Available</span>
                  <span className="sc-time">01:00 PM – 02:00 PM</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="status-card card-4">
                <div className="sc-icon bg-teal-light"><Settings size={16} /></div>
                <div className="sc-info">
                  <strong>Projector</strong>
                  <span className="sc-status text-teal"><span className="status-dot bg-teal"></span>Available</span>
                  <span className="sc-time">02:00 PM – 03:00 PM</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT INTRODUCTION SHOWCASE */}
      <section className="landing-intro bg-muted">
        <div className="landing-container intro-grid">
          <div className="intro-content reveal-on-scroll">
            <h2>Everything your organization needs to manage shared resources.</h2>
            
            <div className="story-list interactive">
              <div 
                className={`story-item ${activeStep === 'discover' ? 'active' : ''}`}
                onMouseEnter={() => setActiveStep('discover')}
              >
                <div className="story-number">01</div>
                <div className="story-text">
                  <h3 className={activeStep === 'discover' ? 'text-teal' : ''}>Discover</h3>
                  <p>Find available rooms and resources across locations.</p>
                </div>
              </div>
              <div 
                className={`story-item ${activeStep === 'book' ? 'active' : ''}`}
                onMouseEnter={() => setActiveStep('book')}
              >
                <div className="story-number">02</div>
                <div className="story-text">
                  <h3 className={activeStep === 'book' ? 'text-teal' : ''}>Book</h3>
                  <p>Select a suitable time and submit your request.</p>
                </div>
              </div>
              <div 
                className={`story-item ${activeStep === 'manage' ? 'active' : ''}`}
                onMouseEnter={() => setActiveStep('manage')}
              >
                <div className="story-number">03</div>
                <div className="story-text">
                  <h3 className={activeStep === 'manage' ? 'text-teal' : ''}>Manage</h3>
                  <p>Track approvals, bookings and availability in real time.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="intro-dashboard reveal-on-scroll">
            <div className="mock-dashboard showcase-dashboard">
              <div className="mock-sidebar">
                <div className="mock-logo">
                  <div className="logo-icon-sm">
                    <span className="text-teal font-bold">R</span>
                  </div>
                  RBS Enterprise
                </div>
                <div className={`mock-nav-item ${activeStep === 'discover' ? 'active' : ''}`}><LayoutDashboard size={14} /> Dashboard</div>
                <div className={`mock-nav-item ${activeStep === 'book' ? 'active' : ''}`}><CalendarCheck size={14} /> My Bookings</div>
                <div className="mock-nav-item"><MapPin size={14} /> Resources</div>
                <div className="mock-nav-item"><Calendar size={14} /> Calendar</div>
                <div className="mock-nav-item"><CheckCircle2 size={14} /> Approvals</div>
                <div className="mock-nav-item"><Settings size={14} /> Settings</div>
                <div className={`mock-nav-item mt-auto ${activeStep === 'manage' ? 'active' : ''}`}><BarChart2 size={14} /> Manage</div>
                <div className="mock-nav-item opacity-50" style={{marginTop: '4px'}}><LayoutDashboard size={14} style={{opacity:0}} /> Logout</div>
              </div>
              
              <div className="mock-main showcase-main">
                {/* STATE 1: DISCOVER */}
                <div className={`showcase-view ${activeStep === 'discover' ? 'view-active' : 'view-hidden'}`}>
                  <div className="mock-header pb-3">
                    <div className="ps-header-left">
                      <div className="mock-title text-lg font-bold text-navy">Discover Resources</div>
                      <p className="text-muted-text text-sm mt-1">Find and explore available rooms, equipment and workspaces.</p>
                    </div>
                    <div className="mock-user">
                      <Bell size={18} className="text-muted-text mr-4" />
                      <div className="text-right mr-3 leading-tight"><div className="text-navy font-bold text-sm">Sidharth P</div><div className="text-muted-text text-xs">Administrator</div></div>
                      <div className="mock-avatar w-10 h-10"></div>
                    </div>
                  </div>
                  
                  <div className="ps-toolbar flex gap-3 mb-4">
                    <div className="ps-search flex-1 bg-white border border-gray-200 rounded flex items-center px-3 py-2">
                      <Search size={16} className="text-muted-text mr-2" />
                      <span className="text-sm text-muted-text">Search rooms, equipment or workspaces...</span>
                    </div>
                    <div className="ps-select bg-white border border-gray-200 rounded flex items-center px-3 py-2 gap-2">
                      <MapPin size={16} className="text-muted-text" />
                      <span className="text-sm font-medium text-navy">All Locations</span>
                      <ChevronRight size={14} className="text-muted-text rotate-90 ml-2" />
                    </div>
                    <div className="ps-btn bg-white border border-gray-200 rounded flex items-center px-4 py-2 gap-2 cursor-pointer">
                      <Filter size={16} className="text-navy" />
                      <span className="text-sm font-medium text-navy">Filters</span>
                    </div>
                  </div>

                  <div className="ps-stats-row grid grid-cols-4 gap-4 mb-6">
                    <div className="ps-stat-card bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-3 items-start mb-2">
                        <div className="stat-icon bg-teal-light p-2 rounded-md"><CalendarCheck size={18} className="text-teal" /></div>
                        <div><span className="text-xs text-muted-text block leading-tight mb-1">Total Resources</span><strong className="text-xl text-navy leading-none block">186</strong></div>
                      </div>
                      <span className="text-[11px] text-muted-text">Across all locations</span>
                    </div>
                    <div className="ps-stat-card bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-3 items-start mb-2">
                        <div className="stat-icon bg-blue-light p-2 rounded-md"><Calendar size={18} className="text-blue-600" /></div>
                        <div><span className="text-xs text-muted-text block leading-tight mb-1">Available Now</span><strong className="text-xl text-navy leading-none block">42</strong></div>
                      </div>
                      <span className="text-[11px] text-muted-text">Ready to book</span>
                    </div>
                    <div className="ps-stat-card bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-3 items-start mb-2">
                        <div className="stat-icon bg-orange-light p-2 rounded-md"><MapPin size={18} className="text-orange-600" /></div>
                        <div><span className="text-xs text-muted-text block leading-tight mb-1">Locations</span><strong className="text-xl text-navy leading-none block">8</strong></div>
                      </div>
                      <span className="text-[11px] text-muted-text">Active locations</span>
                    </div>
                    <div className="ps-stat-card bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-3 items-start mb-2">
                        <div className="stat-icon bg-purple-light p-2 rounded-md" style={{background:'#f3e8ff', color:'#a855f7'}}><Users size={18} /></div>
                        <div><span className="text-xs text-muted-text block leading-tight mb-1">Utilization</span><strong className="text-xl text-navy leading-none block">72%</strong></div>
                      </div>
                      <span className="text-[11px] text-muted-text">This week</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <strong className="text-navy text-sm font-bold">Popular Resources</strong>
                    <span className="text-teal text-xs font-medium flex items-center gap-1 cursor-pointer">View all resources <ChevronRight size={14}/></span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
                      <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80" alt="Meeting Room A" style={{height: '100px'}} className="w-full object-cover" />
                      <div className="p-3 flex-1 flex flex-col">
                        <strong className="text-sm text-navy block leading-tight mb-2">Meeting Room A</strong>
                        <span className="text-xs text-muted-text flex items-center gap-1.5 mb-4"><MapPin size={12}/> Head Office, 2nd Floor</span>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="mock-badge badge-available !py-1 !px-2 !text-[10px]">Available</span>
                          <span className="text-[11px] text-muted-text flex items-center gap-1.5"><Users size={12}/> Capacity: 10</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
                      <img src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=400&q=80" alt="Conference Hall" style={{height: '100px'}} className="w-full object-cover" />
                      <div className="p-3 flex-1 flex flex-col">
                        <strong className="text-sm text-navy block leading-tight mb-2">Conference Hall</strong>
                        <span className="text-xs text-muted-text flex items-center gap-1.5 mb-4"><MapPin size={12}/> Head Office, 1st Floor</span>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="mock-badge badge-available !py-1 !px-2 !text-[10px]">Available</span>
                          <span className="text-[11px] text-muted-text flex items-center gap-1.5"><Users size={12}/> Capacity: 20</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
                      <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80" alt="Projector" style={{height: '100px'}} className="w-full object-cover" />
                      <div className="p-3 flex-1 flex flex-col">
                        <strong className="text-sm text-navy block leading-tight mb-2">Projector</strong>
                        <span className="text-xs text-muted-text flex items-center gap-1.5 mb-4"><MapPin size={12}/> All Locations</span>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="mock-badge badge-available !py-1 !px-2 !text-[10px]">Available</span>
                          <span className="text-[11px] text-muted-text flex items-center gap-1.5"><Settings size={12}/> Quantity: 12</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
                      <img src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=400&q=80" alt="Training Room" style={{height: '130px'}} className="w-full object-cover" />
                      <div className="p-3 flex-1 flex flex-col">
                        <strong className="text-sm text-navy block leading-tight mb-2">Training Room</strong>
                        <span className="text-xs text-muted-text flex items-center gap-1.5 mb-4"><MapPin size={12}/> Branch Office</span>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="mock-badge badge-available !py-1 !px-2 !text-[10px]">Available</span>
                          <span className="text-[11px] text-muted-text flex items-center gap-1.5"><Users size={12}/> Capacity: 25</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-teal-light/30 rounded-lg border border-teal-100 p-3 flex justify-between items-center mt-auto">
                    <div className="flex gap-3 items-center">
                       <div className="bg-white p-2 rounded shadow-sm"><Search size={16} className="text-teal" /></div>
                       <div>
                         <strong className="text-navy text-sm block leading-tight mb-1">Quick discovery</strong>
                         <span className="text-muted-text text-xs">Use search and filters to quickly find the right resource for your needs.</span>
                       </div>
                    </div>
                    <div className="border border-teal-200 text-teal bg-white rounded px-4 py-2 text-xs font-medium cursor-pointer shadow-sm">Explore Resources</div>
                  </div>
                </div>

                {/* STATE 2: BOOK */}
                <div className={`showcase-view flex flex-col ${activeStep === 'book' ? 'view-active' : 'view-hidden'}`}>
                  <div className="mock-header pb-2 border-b border-gray-200 mb-3">
                    <div className="ps-header-left">
                      <div className="mock-title text-base font-bold text-navy">Book a Resource</div>
                      <p className="text-muted-text text-xs mt-0.5">Choose a resource, date and time to make a booking.</p>
                    </div>
                    <div className="mock-user">
                      <Bell size={18} className="text-muted-text mr-4" />
                      <div className="text-right mr-3 leading-tight"><div className="text-navy font-bold text-sm">Sidharth P</div><div className="text-muted-text text-xs">Administrator</div></div>
                      <div className="mock-avatar w-10 h-10"></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                          <div className="bg-teal-light p-1.5 rounded mt-0.5"><LayoutDashboard size={14} className="text-teal" /></div>
                          <div>
                            <span className="text-[10px] text-muted-text block leading-tight mb-0.5">Resource</span>
                            <strong className="text-xs text-navy block leading-tight">Meeting Room A</strong>
                            <span className="text-[10px] text-muted-text block mt-0.5">Head Office, 2nd Floor</span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-muted-text rotate-90" />
                      </div>
                    </div>
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg flex items-center px-2 py-1 gap-2">
                      <Calendar size={14} className="text-muted-text" />
                      <div className="flex-1 leading-tight">
                        <strong className="block text-xs text-navy mb-0.5">May 20, 2026</strong>
                        <span className="text-[10px] text-muted-text">Tuesday</span>
                      </div>
                      <ChevronRight size={12} className="text-muted-text rotate-90" />
                    </div>
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg flex items-center px-2 py-1 gap-2">
                      <Clock size={14} className="text-muted-text" />
                      <div className="flex-1 leading-tight">
                        <strong className="block text-xs text-navy mb-0.5">10:00 AM - 11:00 AM</strong>
                        <span className="text-[10px] text-muted-text">1 hour</span>
                      </div>
                      <ChevronRight size={12} className="text-muted-text rotate-90" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg flex items-center px-3 py-1 gap-1.5 cursor-pointer">
                      <Filter size={14} className="text-navy" />
                      <span className="text-xs font-medium text-navy">Filters</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
                    <div className="col-span-2 bg-white border border-gray-200 rounded-lg flex flex-col min-h-0 relative">
                      <div className="flex justify-between items-center p-2 border-b border-gray-100">
                        <div className="flex gap-1.5 items-center">
                          <ChevronLeft size={14} className="text-muted-text cursor-pointer"/>
                          <span className="text-xs font-bold text-navy mx-1.5">May 18 - May 24, 2026</span>
                          <ChevronRight size={14} className="text-muted-text cursor-pointer"/>
                        </div>
                        <div className="flex bg-gray-50 rounded p-1 border border-gray-200">
                          <span className="text-[10px] px-2 py-0.5 text-muted-text cursor-pointer">Day</span>
                          <span className="text-[10px] px-2 py-0.5 bg-white shadow-sm rounded border border-gray-200 font-medium text-navy">Week</span>
                          <span className="text-[10px] px-2 py-0.5 text-muted-text cursor-pointer">Month</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-1 relative overflow-hidden text-[10px]">
                         <div className="w-10 flex flex-col justify-between pt-5 pb-1 text-right pr-2 text-muted-text text-[9px] font-medium border-r border-gray-100">
                           <span>9 AM</span><span>10 AM</span><span>11 AM</span><span>12 PM</span><span>1 PM</span><span>2 PM</span><span>3 PM</span><span>4 PM</span>
                         </div>
                         <div className="flex-1 grid grid-cols-7 relative pt-2">
                           {/* Grid Lines */}
                           <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_90%,#f1f5f9_90%)]" style={{backgroundSize: '100% 14.28%', zIndex: 0}}></div>
                           
                           {['Sun 18', 'Mon 19', 'Tue 20', 'Wed 21', 'Thu 22', 'Fri 23', 'Sat 24'].map((day, i) => (
                             <div key={i} className={`border-r border-gray-100 relative z-10 ${i===2 ? 'bg-teal-50/20' : ''}`}>
                               <div className="text-center mb-1.5">
                                 <span className="block text-[9px] font-medium text-muted-text uppercase tracking-wide">{day.split(' ')[0]}</span>
                                 <strong className={`block text-[11px] mt-0.5 ${i===2 ? 'bg-teal text-white w-5 h-5 rounded-full mx-auto flex items-center justify-center' : 'text-navy'}`}>{day.split(' ')[1]}</strong>
                               </div>
                               
                               {i === 1 && (
                                 <div className="absolute left-1 right-1 top-[14%] h-[14%] bg-blue-50 border-l-2 border-blue-500 rounded p-1 overflow-hidden">
                                   <strong className="block text-[8px] text-blue-800 font-bold truncate">Team Sync</strong>
                                   <span className="block text-[7px] text-blue-600 truncate mt-[1px]">9:00 - 10:00 AM</span>
                                 </div>
                               )}
                               {i === 2 && (
                                 <div className="absolute left-1 right-1 top-[28%] h-[14%] bg-green-50 border-l-2 border-green-500 rounded p-1 overflow-hidden shadow-sm ring-1 ring-green-500 ring-opacity-50">
                                   <strong className="block text-[8px] text-green-800 font-bold truncate">Your Selection</strong>
                                   <span className="block text-[7px] text-green-600 truncate mt-[1px]">10:00 - 11:00 AM</span>
                                 </div>
                               )}
                               {i === 3 && (
                                 <div className="absolute left-1 right-1 top-[42%] h-[14%] bg-blue-50 border-l-2 border-blue-500 rounded p-1 overflow-hidden">
                                   <strong className="block text-[8px] text-blue-800 font-bold truncate">Project Review</strong>
                                   <span className="block text-[7px] text-blue-600 truncate mt-[1px]">11:00 - 12:00 PM</span>
                                 </div>
                               )}
                               {i === 4 && (
                                 <div className="absolute left-1 right-1 top-[84%] h-[14%] bg-orange-50 border-l-2 border-orange-500 rounded p-1 overflow-hidden">
                                   <strong className="block text-[8px] text-orange-800 font-bold truncate">Strategy Session</strong>
                                   <span className="block text-[7px] text-orange-600 truncate mt-[1px]">3:00 - 4:00 PM</span>
                                 </div>
                               )}
                               {i === 5 && (
                                 <div className="absolute left-1 right-1 top-[70%] h-[14%] bg-purple-50 border-l-2 border-purple-500 rounded p-1 overflow-hidden">
                                   <strong className="block text-[8px] text-purple-800 font-bold truncate">Client Meeting</strong>
                                   <span className="block text-[7px] text-purple-600 truncate mt-[1px]">2:00 - 3:00 PM</span>
                                 </div>
                               )}
                             </div>
                           ))}
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-2 border-t border-gray-100 text-[10px] text-muted-text justify-center bg-gray-50/80">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Your Selection</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Booked</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Pending</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> External</div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-2.5 flex flex-col shadow-sm">
                      <strong className="block text-xs text-navy mb-2 border-b border-gray-100 pb-1.5">Booking Summary</strong>
                      
                      <div className="flex gap-2 items-start mb-2">
                        <LayoutDashboard size={12} className="text-muted-text mt-0.5"/>
                        <div className="leading-tight">
                          <span className="text-[10px] text-muted-text block mb-0.5">Resource</span>
                          <strong className="text-xs text-navy block">Meeting Room A</strong>
                          <span className="text-[10px] text-muted-text mt-0.5 block">Head Office, 2nd Floor</span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start mb-2">
                        <Calendar size={12} className="text-muted-text mt-0.5"/>
                        <div className="leading-tight">
                          <span className="text-[10px] text-muted-text block mb-0.5">Date</span>
                          <strong className="text-xs text-navy block">Tuesday, May 20, 2026</strong>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start mb-2">
                        <Clock size={12} className="text-muted-text mt-0.5"/>
                        <div className="leading-tight">
                          <span className="text-[10px] text-muted-text block mb-0.5">Time</span>
                          <strong className="text-xs text-navy block">10:00 AM - 11:00 AM</strong>
                          <span className="text-[10px] text-muted-text block mt-0.5">(1 hour)</span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start mb-2.5">
                        <Users size={12} className="text-muted-text mt-0.5"/>
                        <div className="leading-tight">
                          <span className="text-[10px] text-muted-text block mb-0.5">Capacity</span>
                          <strong className="text-xs text-navy block">10 People</strong>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <span className="text-[10px] font-medium text-muted-text block mb-1">Amenities included</span>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-navy">
                          <div className="flex items-center gap-1"><Check size={10} className="text-teal"/> Display</div>
                          <div className="flex items-center gap-1"><Check size={10} className="text-teal"/> Whiteboard</div>
                          <div className="flex items-center gap-1"><Check size={10} className="text-teal"/> Video Conf</div>
                          <div className="flex items-center gap-1"><Check size={10} className="text-teal"/> Wi-Fi</div>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex flex-col gap-1.5 pt-1">
                        <div className="bg-teal text-white text-center rounded py-1.5 text-xs font-medium cursor-pointer hover:bg-dark-teal transition-colors shadow-sm">Continue to Details</div>
                        <div className="border border-teal text-teal text-center rounded py-1.5 text-xs font-medium cursor-pointer hover:bg-teal-50 transition-colors">Check Availability</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STATE 3: MANAGE */}
                <div className={`showcase-view flex flex-col ${activeStep === 'manage' ? 'view-active' : 'view-hidden'}`}>
                  <div className="mock-header pb-3 border-b border-gray-200">
                    <div className="ps-header-left">
                      <div className="mock-title text-lg font-bold text-navy">Manage & Track</div>
                      <p className="text-muted-text text-sm mt-1">Track bookings, approvals and resource utilization in real time.</p>
                    </div>
                    <div className="mock-user">
                      <Bell size={18} className="text-muted-text mr-4" />
                      <div className="text-right mr-3 leading-tight"><div className="text-navy font-bold text-sm">Sidharth P</div><div className="text-muted-text text-xs">Administrator</div></div>
                      <div className="mock-avatar w-10 h-10"></div>
                    </div>
                  </div>
                  
                  <div className="ps-stats-row grid grid-cols-5 gap-3 mt-4 mb-4">
                    <div className="ps-stat-card bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex gap-2.5 items-start mb-2">
                        <div className="stat-icon bg-teal-light p-2 rounded-md"><CalendarCheck size={16} className="text-teal" /></div>
                        <div><span className="text-xs text-muted-text block leading-tight mb-0.5">My Bookings</span><strong className="text-lg text-navy leading-none block">16</strong></div>
                      </div>
                      <span className="text-[11px] text-muted-text">Total</span>
                    </div>
                    <div className="ps-stat-card bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex gap-2.5 items-start mb-2">
                        <div className="stat-icon bg-blue-light p-2 rounded-md"><Calendar size={16} className="text-blue-600" /></div>
                        <div><span className="text-xs text-muted-text block leading-tight mb-0.5">Upcoming</span><strong className="text-lg text-navy leading-none block">5</strong></div>
                      </div>
                      <span className="text-[11px] text-muted-text">Next 7 days</span>
                    </div>
                    <div className="ps-stat-card bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex gap-2.5 items-start mb-2">
                        <div className="stat-icon bg-green-light p-2 rounded-md"><CheckCircle2 size={16} className="text-green-600" /></div>
                        <div><span className="text-xs text-muted-text block leading-tight mb-0.5">Approved</span><strong className="text-lg text-navy leading-none block">11</strong></div>
                      </div>
                      <span className="text-[11px] text-muted-text">This month</span>
                    </div>
                    <div className="ps-stat-card bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex gap-2.5 items-start mb-2">
                        <div className="stat-icon bg-orange-light p-2 rounded-md"><Clock size={16} className="text-orange-600" /></div>
                        <div><span className="text-xs text-muted-text block leading-tight mb-0.5">Pending</span><strong className="text-lg text-navy leading-none block">3</strong></div>
                      </div>
                      <span className="text-[11px] text-muted-text">Awaiting approval</span>
                    </div>
                    <div className="ps-stat-card bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex gap-2.5 items-start mb-2">
                        <div className="stat-icon p-2 rounded-md" style={{background:'#f3e8ff', color:'#a855f7'}}><PieChart size={16} /></div>
                        <div><span className="text-xs text-muted-text block leading-tight mb-0.5">Utilization</span><strong className="text-lg text-navy leading-none block">68%</strong></div>
                      </div>
                      <span className="text-[11px] text-muted-text">This month</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4 flex-1 min-h-0">
                    <div className="col-span-3 bg-white rounded-lg border border-gray-200 p-4 flex flex-col min-h-0 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <strong className="text-navy text-sm font-bold">My Bookings</strong>
                        <span className="text-teal text-xs font-medium flex items-center gap-1.5 cursor-pointer">View Calendar <Calendar size={14}/></span>
                      </div>
                      <div className="flex gap-5 text-xs font-medium border-b border-gray-100 pb-2 mb-3">
                        <span className="text-teal border-b-2 border-teal -mb-[9px] pb-[7px]">Upcoming</span>
                        <span className="text-muted-text cursor-pointer hover:text-navy">Past</span>
                        <span className="text-muted-text cursor-pointer hover:text-navy">Cancelled</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 overflow-y-auto pr-1">
                        <div className="flex gap-3 items-center py-2.5 border-b border-gray-50">
                          <div className="text-center w-12 bg-gray-50 rounded-md py-1.5 border border-gray-100">
                             <strong className="block text-[9px] text-muted-text leading-none mb-0.5">MAY</strong>
                             <span className="block text-sm font-bold text-navy leading-none mb-0.5">20</span>
                             <span className="block text-[9px] text-muted-text leading-none">TUE</span>
                          </div>
                          <div className="flex-1 leading-tight">
                            <strong className="text-navy text-sm block mb-1">Meeting Room A</strong>
                            <span className="text-muted-text text-xs block mb-1">Head Office, 2nd Floor</span>
                            <span className="text-muted-text text-xs block">10:00 AM - 11:00 AM (1 hour) &nbsp;&bull;&nbsp; <Users size={12} className="inline mr-0.5"/> 10 People</span>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5">
                             <span className="mock-badge badge-approved !text-[10px] !px-2.5 !py-1">Approved</span>
                             <span className="text-[10px] text-muted-text">ID: #BK1024</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 ml-1 cursor-pointer hover:text-gray-500" />
                        </div>
                        <div className="flex gap-3 items-center py-2.5 border-b border-gray-50">
                          <div className="text-center w-12 bg-gray-50 rounded-md py-1.5 border border-gray-100">
                             <strong className="block text-[9px] text-muted-text leading-none mb-0.5">MAY</strong>
                             <span className="block text-sm font-bold text-navy leading-none mb-0.5">21</span>
                             <span className="block text-[9px] text-muted-text leading-none">WED</span>
                          </div>
                          <div className="flex-1 leading-tight">
                            <strong className="text-navy text-sm block mb-1">Conference Hall</strong>
                            <span className="text-muted-text text-xs block mb-1">Head Office, 1st Floor</span>
                            <span className="text-muted-text text-xs block">02:00 PM - 04:00 PM (2 hours) &nbsp;&bull;&nbsp; <Users size={12} className="inline mr-0.5"/> 20 People</span>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5">
                             <span className="mock-badge badge-approved !text-[10px] !px-2.5 !py-1">Approved</span>
                             <span className="text-[10px] text-muted-text">ID: #BK1025</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 ml-1 cursor-pointer hover:text-gray-500" />
                        </div>
                        <div className="flex gap-3 items-center py-2.5">
                          <div className="text-center w-12 bg-gray-50 rounded-md py-1.5 border border-gray-100">
                             <strong className="block text-[9px] text-muted-text leading-none mb-0.5">MAY</strong>
                             <span className="block text-sm font-bold text-navy leading-none mb-0.5">22</span>
                             <span className="block text-[9px] text-muted-text leading-none">THU</span>
                          </div>
                          <div className="flex-1 leading-tight">
                            <strong className="text-navy text-sm block mb-1">Projector</strong>
                            <span className="text-muted-text text-xs block mb-1">All Locations</span>
                            <span className="text-muted-text text-xs block">11:00 AM - 12:00 PM (1 hour)</span>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5">
                             <span className="mock-badge badge-pending !text-[10px] !px-2.5 !py-1">Pending</span>
                             <span className="text-[10px] text-muted-text">ID: #BK1026</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 ml-1 cursor-pointer hover:text-gray-500" />
                        </div>
                      </div>
                      <div className="text-center mt-auto pt-3 border-t border-gray-50"><span className="text-teal text-[11px] font-medium cursor-pointer hover:underline">View all bookings <ChevronRight size={12} className="inline rotate-90 ml-0.5"/></span></div>
                    </div>
                                 <div className="col-span-2 flex flex-col gap-4 min-h-0">
                      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                         <div className="flex justify-between items-center mb-3">
                           <strong className="text-navy text-sm font-bold">Approvals</strong>
                           <span className="text-teal text-xs font-medium cursor-pointer hover:underline">View all</span>
                         </div>
                         <div className="flex flex-col gap-3">
                           <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                             <div className="leading-tight">
                               <strong className="text-navy text-xs block mb-1">Conference Hall</strong>
                               <span className="text-muted-text text-[10px] block mb-1">May 24, 2026 &bull; 10:00 AM - 12:00 PM</span>
                               <span className="text-muted-text text-[10px] block">Requested by Priya S.</span>
                             </div>
                             <div className="text-right">
                               <span className="mock-badge badge-pending !text-[10px] !px-2 !py-1 block mb-1.5 text-center">Pending</span>
                               <span className="text-[10px] text-muted-text block">2h ago</span>
                             </div>
                           </div>
                           <div className="flex justify-between items-start">
                             <div className="leading-tight">
                               <strong className="text-navy text-xs block mb-1">Meeting Room B</strong>
                               <span className="text-muted-text text-[10px] block mb-1">May 24, 2026 &bull; 01:00 PM - 02:00 PM</span>
                               <span className="text-muted-text text-[10px] block">Requested by Arjun R.</span>
                             </div>
                             <div className="text-right">
                               <span className="mock-badge badge-approved !text-[10px] !px-2 !py-1 block mb-1.5 text-center">Approved</span>
                               <span className="text-[10px] text-muted-text block">5h ago</span>
                             </div>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-white rounded-lg p-3 flex justify-between items-center border border-gray-200 shadow-sm">
                    <div className="flex gap-3 items-center">
                       <div className="bg-teal-light p-2 rounded-md"><PieChart size={16} className="text-teal" /></div>
                       <div>
                         <strong className="text-navy text-xs block mb-0.5">Insight</strong>
                         <span className="text-muted-text text-xs">Conference rooms are most utilized on Tuesdays and Wednesdays.</span>
                       </div>
                    </div>
                    <div className="border border-teal-200 text-teal bg-white rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer flex items-center gap-1 hover:bg-teal-50"><BarChart2 size={14}/> View Reports</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 4. RESOURCE MANAGEMENT SHOWCASE */}
      <section id="resources" className="landing-resources">
        <div className="landing-container resources-grid">
          <div className="resources-visual reveal-on-scroll">
             <div className="mock-table-ui">
               <div className="mock-table-header">
                 <div className="mock-th-title">Resources</div>
                 <div className="mock-btn"><Check size={14}/> Add Resource</div>
               </div>
               <div className="mock-table-toolbar">
                 <div className="mock-tabs">
                   <div className="mock-tab">All</div>
                   <div className="mock-tab active">Meeting Rooms</div>
                   <div className="mock-tab">Conference Rooms</div>
                   <div className="mock-tab">Equipment</div>
                   <div className="mock-tab">Workspaces</div>
                 </div>
               </div>
               <div className="table-wrapper">
                 <table className="mock-table">
                   <thead>
                     <tr>
                       <th>Resource</th>
                       <th>Type</th>
                       <th>Location</th>
                       <th>Capacity</th>
                       <th>Status</th>
                       <th>Availability</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr>
                       <td><Lock size={14} className="mr-2 inline text-muted-text" /> <strong>Executive Meeting Room</strong></td>
                       <td>Meeting Room</td>
                       <td>Head Office</td>
                       <td>12</td>
                       <td><span className="mock-badge badge-available">Available</span></td>
                       <td>Today<br/>+9 Slots</td>
                     </tr>
                     <tr>
                       <td><Lock size={14} className="mr-2 inline text-muted-text" /> <strong>Conference Room A</strong></td>
                       <td>Conference Room</td>
                       <td>Head Office</td>
                       <td>20</td>
                       <td><span className="mock-badge badge-booked">Booked</span></td>
                       <td>Today<br/>+2 Slots</td>
                     </tr>
                     <tr>
                       <td><Target size={14} className="mr-2 inline text-muted-text" /> <strong>Training Room</strong></td>
                       <td>Meeting Room</td>
                       <td>2nd Floor</td>
                       <td>15</td>
                       <td><span className="mock-badge badge-available">Available</span></td>
                       <td>Today<br/>+6 Slots</td>
                     </tr>
                     <tr>
                       <td><Settings size={14} className="mr-2 inline text-muted-text" /> <strong>Projector</strong></td>
                       <td>Equipment</td>
                       <td>All Locations</td>
                       <td>–</td>
                       <td><span className="mock-badge badge-available">Available</span></td>
                       <td>Today<br/>+1 Slot</td>
                     </tr>
                     <tr>
                       <td><Target size={14} className="mr-2 inline text-muted-text" /> <strong>Video Conferencing Kit</strong></td>
                       <td>Equipment</td>
                       <td>Head Office</td>
                       <td>–</td>
                       <td><span className="mock-badge badge-booked">Booked</span></td>
                       <td>Tomorrow<br/>+3 Slots</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
          
          <div className="resources-text reveal-on-scroll">
            <h2>
              Know what is available.<br/>
              Know where it is.<br/>
              Know when you can use it.
            </h2>
            <p>
              View real-time availability of rooms, equipment and workspaces across your organization.
            </p>
          </div>
        </div>
      </section>

      {/* 4.5 CONTINUOUS STATUS RAIL */}
      <section className="status-rail-section">
        <div className="status-rail-wrapper">
          <div className="status-rail-track">
            {[1, 2].map((set) => (
              <div className="status-rail-group" key={set}>
                <div className="rail-item">
                  <div className="rail-dot bg-teal"></div>
                  <span className="rail-status text-teal">Available</span>
                  <strong className="rail-name">Meeting Room A</strong>
                </div>
                <div className="rail-divider"></div>
                
                <div className="rail-item">
                  <div className="rail-dot bg-orange"></div>
                  <span className="rail-status text-orange">Booked</span>
                  <strong className="rail-name">Conference Room B</strong>
                </div>
                <div className="rail-divider"></div>
                
                <div className="rail-item">
                  <div className="rail-dot bg-teal"></div>
                  <span className="rail-status text-teal">Available</span>
                  <strong className="rail-name">Projector</strong>
                </div>
                <div className="rail-divider"></div>
                
                <div className="rail-item">
                  <div className="rail-dot bg-teal"></div>
                  <span className="rail-status text-teal">Available</span>
                  <strong className="rail-name">Training Room</strong>
                </div>
                <div className="rail-divider"></div>

                <div className="rail-item">
                  <div className="rail-dot bg-teal"></div>
                  <span className="rail-status text-teal">Available</span>
                  <strong className="rail-name">Executive Meeting Room</strong>
                </div>
                <div className="rail-divider"></div>

                <div className="rail-item">
                  <div className="rail-dot bg-orange"></div>
                  <span className="rail-status text-orange">Booked</span>
                  <strong className="rail-name">Conference Room A</strong>
                </div>
                <div className="rail-divider"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW BOOKING WORKS */}
      <section id="how-it-works" className="landing-booking">
        <div className="landing-container text-center">
          <h2 className="section-title reveal-on-scroll">How booking works</h2>
          
          <div className="booking-infographic reveal-on-scroll">
            <div className="annotation-left">
              <div className="annotation-box">
                <div className="anno-header"><Search size={18} className="text-teal" /> <strong>01 Find</strong></div>
                <p>Choose the resource you need.</p>
              </div>
              <div className="connector-line-left"></div>
            </div>

            <div className="mock-calendar">
              <div className="calendar-header">
                <div className="cal-nav">
                  <span>Today</span>
                  <div className="cal-arrows"><ChevronRight size={14} className="rotate-180" /><ChevronRight size={14} /></div>
                </div>
                <div className="cal-views">
                  <span>Day</span><span>Week</span><span>Month</span>
                </div>
              </div>
              <div className="calendar-grid-wrapper">
                <div className="cal-times">
                  <span>9 AM</span><span>10 AM</span><span>11 AM</span><span>12 PM</span><span>1 PM</span><span>2 PM</span><span>3 PM</span><span>4 PM</span>
                </div>
                <div className="cal-days">
                  <div className="cal-col">
                    <div className="day-header"><span>Sun</span><strong>17</strong></div>
                  </div>
                  <div className="cal-col">
                    <div className="day-header"><span>Mon</span><strong>18</strong></div>
                    <div className="cal-event green" style={{top: '14%', height: '14%'}}>
                      <strong>Meeting Room A</strong>
                    </div>
                  </div>
                  <div className="cal-col">
                    <div className="day-header"><span>Tue</span><strong>19</strong></div>
                  </div>
                  <div className="cal-col active">
                    <div className="day-header"><span>Wed</span><strong>20</strong></div>
                    <div className="cal-event blue" style={{top: '30%', height: '15%'}}>
                      <strong>Conference Hall</strong>
                    </div>
                    <div className="cal-unavailable" style={{top: '80%', height: '20%'}}>Unavailable</div>
                  </div>
                  <div className="cal-col">
                    <div className="day-header"><span>Thu</span><strong>21</strong></div>
                    <div className="cal-event orange" style={{top: '60%', height: '15%'}}>
                       <strong>Training Room</strong>
                    </div>
                  </div>
                  <div className="cal-col">
                    <div className="day-header"><span>Fri</span><strong>22</strong></div>
                  </div>
                  <div className="cal-col">
                    <div className="day-header"><span>Sat</span><strong>23</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="annotations-right">
              <div className="annotation-right-top">
                <div className="connector-line-right-top"></div>
                <div className="annotation-box">
                  <div className="anno-header"><Calendar size={18} className="text-teal" /> <strong>02 Schedule</strong></div>
                  <p>Select an available time that works for you.</p>
                </div>
              </div>
              
              <div className="annotation-right-bottom">
                <div className="connector-line-right-bottom"></div>
                <div className="annotation-box">
                  <div className="anno-header"><CheckCircle2 size={18} className="text-teal" /> <strong>03 Confirm</strong></div>
                  <p>Submit your request and track its progress.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. USER + ADMIN EXPERIENCE */}
      <section className="landing-experience bg-muted">
        <div className="landing-container exp-grid">
          <div className="exp-side user-exp reveal-on-scroll">
            <div className="exp-text">
              <h2>Built for everyone</h2>
              <p>Employees can easily find resources, check availability, and manage their bookings.</p>
              <Link to="/login" className="btn btn-primary mt-2">Explore User Dashboard</Link>
            </div>
            <div className="exp-ui">
              <div className="mini-dashboard">
                <div className="mini-sidebar bg-navy">
                  <div className="mini-nav-icon"><LayoutDashboard size={14}/></div>
                  <div className="mini-nav-icon active"><CalendarCheck size={14}/></div>
                  <div className="mini-nav-icon"><Calendar size={14}/></div>
                  <div className="mini-nav-icon"><Search size={14}/></div>
                </div>
                <div className="mini-main">
                  <div className="mini-header">My Bookings</div>
                  <div className="mini-content-row">
                    <div className="mini-calendar-widget">
                      <div className="mc-header">
                        <ChevronRight size={12} className="rotate-180"/>
                        <strong>May 2026</strong>
                        <ChevronRight size={12}/>
                      </div>
                      <div className="mc-days-header">
                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                      </div>
                      <div className="mc-grid">
                        {Array.from({length: 35}).map((_, i) => <div key={i} className={`mc-day ${i===17 ? 'active' : ''}`}>{i > 0 && i < 32 ? i : ''}</div>)}
                      </div>
                    </div>
                    <div className="mini-list flex-1">
                      <div className="mock-list-header text-xs">Upcoming</div>
                      <div className="mini-item">
                        <div><strong>Executive Meeting Room</strong><span>May 20, 10:00 AM<br/>Team Meeting</span></div>
                        <span className="mini-badge badge-approved">Approved</span>
                      </div>
                      <div className="mini-item">
                        <div><strong>Conference Hall</strong><span>May 21, 02:00 PM<br/>Client Presentation</span></div>
                        <span className="mini-badge badge-approved">Approved</span>
                      </div>
                    </div>
                  </div>
                  <div className="mini-resources-row mt-4">
                    <div className="mock-list-header text-xs mb-2">Available Resources</div>
                    <div className="mr-cards">
                      <div className="mr-card">
                        <LayoutDashboard size={14}/>
                        <div><strong>Meeting Room A</strong><span>12 Capacity</span></div>
                        <div className="mr-btn">View</div>
                      </div>
                      <div className="mr-card">
                        <LayoutDashboard size={14}/>
                        <div><strong>Conference Hall</strong><span>50 Capacity</span></div>
                        <div className="mr-btn">View</div>
                      </div>
                      <div className="mr-card">
                        <LayoutDashboard size={14}/>
                        <div><strong>Training Room</strong><span>15 Capacity</span></div>
                        <div className="mr-btn">View</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="exp-side admin-exp reveal-on-scroll">
            <div className="exp-text">
              <h2>Powerful for administrators</h2>
              <p>Admins can manage resources, review requests, approve bookings and keep everything organized.</p>
              <Link to="/login" className="btn btn-primary bg-navy mt-2">Explore Admin Dashboard</Link>
            </div>
            <div className="exp-ui">
               <div className="mini-dashboard">
                <div className="mini-sidebar bg-navy">
                  <div className="mini-nav-icon"><LayoutDashboard size={14}/></div>
                  <div className="mini-nav-icon"><CheckCircle2 size={14}/></div>
                  <div className="mini-nav-icon active"><Users size={14}/></div>
                  <div className="mini-nav-icon"><Settings size={14}/></div>
                  <div className="mini-nav-icon"><Bell size={14}/></div>
                </div>
                <div className="mini-main">
                  <div className="mini-header">Booking Requests</div>
                  <div className="mock-tabs mb-4">
                    <div className="mock-tab active">All</div>
                    <div className="mock-tab">Pending</div>
                    <div className="mock-tab">Approved</div>
                    <div className="mock-tab">Rejected</div>
                  </div>
                  <div className="mini-list mb-4">
                    <div className="mini-item-row">
                      <div className="user-info"><div className="ua">AK</div> <strong>Arun Kumar</strong></div>
                      <span>Meeting Room A</span>
                      <span>May 21, 10:00 AM</span>
                      <span className="mini-badge badge-pending">Pending</span>
                    </div>
                    <div className="mini-item-row">
                      <div className="user-info"><div className="ua">PS</div> <strong>Priya Sharma</strong></div>
                      <span>Conference Hall</span>
                      <span>May 21, 01:00 PM</span>
                      <span className="mini-badge badge-pending">Pending</span>
                    </div>
                    <div className="mini-item-row">
                      <div className="user-info"><div className="ua">NP</div> <strong>Nikhil Patel</strong></div>
                      <span>Training Room</span>
                      <span>May 21, 09:00 AM</span>
                      <span className="mini-badge badge-pending">Pending</span>
                    </div>
                    <div className="mini-item-row">
                      <div className="user-info"><div className="ua">SR</div> <strong>Sneha Reddy</strong></div>
                      <span>Meeting Room B</span>
                      <span>May 22, 11:00 AM</span>
                      <span className="mini-badge badge-approved">Approved</span>
                    </div>
                  </div>
                  <div className="text-center mb-4"><span className="text-xs font-semibold text-navy">View All Requests</span></div>
                  <div className="mini-stats">
                    <div className="ms-box"><span>Resources</span><strong>56</strong></div>
                    <div className="ms-box"><span>Users</span><strong>342</strong></div>
                    <div className="ms-box"><span>Pending Approvals</span><strong>8</strong></div>
                    <div className="ms-box"><span>This Month Bookings</span><strong>128</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRUST SECTION */}
      <section id="about" className="landing-trust">
        <div className="landing-container text-center reveal-on-scroll">
          <h2 className="trust-heading text-center" style={{ textAlign: 'center', margin: '0 auto 48px auto', display: 'block', width: '100%' }}>
            One platform. Every shared resource.<br />Complete visibility.
          </h2>
          
          <div className="trust-features">
            <div className="tf-item">
              <Clock className="text-teal" size={24} />
              <span>Real-time availability</span>
            </div>
            <div className="tf-divider"></div>
            <div className="tf-item">
              <Shield className="text-teal" size={24} />
              <span>Secure booking</span>
            </div>
            <div className="tf-divider"></div>
            <div className="tf-item">
              <CheckCircle2 className="text-teal" size={24} />
              <span>Approval workflows</span>
            </div>
            <div className="tf-divider"></div>
            <div className="tf-item">
              <LayoutDashboard className="text-teal" size={24} />
              <span>Centralized management</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="landing-cta bg-navy text-white">
        <div className="landing-container reveal-on-scroll">
          <div className="cta-wrapper">
            <div className="cta-content">
              <div className="cta-icon-sm mb-4">
                 <Shield size={28} className="text-teal" />
              </div>
              <h2>Make resource management effortless.</h2>
              <p>Give your organization a simpler way to discover, book and manage shared resources.</p>
            </div>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
              <Link to="/login" className="btn btn-outline border-white text-white hover-bg-white-10 btn-lg">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer id="contact" className="landing-footer">
        <div className="landing-container footer-grid">
          <div className="footer-brand">
            <div className="landing-logo mb-4">
              <div className="logo-r">R</div>
              <div className="logo-text">
                <strong className="logo-wordmark">BS Enterprise</strong>
                <span className="logo-sub">esource Booking System</span>
              </div>
            </div>
            <p className="footer-desc">
              Streamline your resource management and booking experience.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-icon">in</a>
              <a href="#" className="social-icon">f</a>
              <a href="#" className="social-icon">t</a>
              <a href="#" className="social-icon">@</a>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#resources">Resources</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#">Pricing</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
              <a href="#">Careers</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Guides</a>
              <a href="#">Privacy Policy</a>
            </div>
            <div className="footer-newsletter">
              <h4>Stay Updated</h4>
              <p>Subscribe to get updates and product news.</p>
              <div className="newsletter-input">
                <input type="email" placeholder="Enter your email" />
                <button className="bg-teal"><ChevronRight size={16} className="text-white" /></button>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom landing-container">
          <p>© 2026 RBS Enterprise. All rights reserved.</p>
          <Link 
            to="/super-admin/login" 
            style={{ fontSize: '0.8125rem', color: 'var(--c-muted-text)', opacity: 0.7, textDecoration: 'none' }}
            onMouseOver={(e) => e.target.style.opacity = 1}
            onMouseOut={(e) => e.target.style.opacity = 0.7}
          >
            Platform Administration
          </Link>
        </div>
      </footer>
    </div>
  );
}
