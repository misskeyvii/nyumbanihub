import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import SEO from '../../components/base/SEO';

const departments: { name: string; icon: string; color: string; bg: string; positions: string[] }[] = [
  { name: 'Executive Management', icon: 'ri-vip-crown-fill', color: 'text-amber-600', bg: 'bg-amber-50', positions: ['Founder & Chief Executive Officer (CEO)', 'Chief Operating Officer (COO)', 'Executive Assistant', 'Strategy & Business Development Manager'] },
  { name: 'Administration & HR', icon: 'ri-team-fill', color: 'text-blue-600', bg: 'bg-blue-50', positions: ['Human Resource Manager', 'HR Officer', 'Recruitment Officer', 'Administrative Officer', 'Office Administrator', 'Receptionist', 'Office Assistant', 'Records Officer'] },
  { name: 'Finance & Accounts', icon: 'ri-money-dollar-circle-fill', color: 'text-emerald-600', bg: 'bg-emerald-50', positions: ['Finance Manager', 'Accountant', 'Assistant Accountant', 'Accounts Receivable Officer', 'Accounts Payable Officer', 'Payroll Officer', 'Internal Auditor', 'Procurement Officer', 'Storekeeper'] },
  { name: 'Technology', icon: 'ri-code-s-slash-fill', color: 'text-violet-600', bg: 'bg-violet-50', positions: ['Chief Technology Officer (CTO)', 'Software Engineer (Frontend)', 'Software Engineer (Backend)', 'Full Stack Developer', 'Mobile App Developer (Android)', 'Mobile App Developer (iOS)', 'UI/UX Designer', 'DevOps Engineer', 'Database Administrator', 'QA/Software Tester', 'Cybersecurity Officer', 'IT Support Technician', 'Systems Administrator', 'AI Engineer', 'API Integration Developer'] },
  { name: 'Sales', icon: 'ri-line-chart-fill', color: 'text-rose-600', bg: 'bg-rose-50', positions: ['Sales Manager', 'Corporate Sales Executive', 'Property Sales Executive', 'Field Sales Representative', 'Business Development Officer', 'Sales Coordinator', 'Partnerships Manager'] },
  { name: 'Marketing', icon: 'ri-megaphone-fill', color: 'text-pink-600', bg: 'bg-pink-50', positions: ['Marketing Manager', 'Digital Marketing Specialist', 'Social Media Manager', 'Content Creator', 'Graphic Designer', 'Videographer', 'Photographer', 'Copywriter', 'SEO Specialist', 'Email Marketing Specialist', 'Brand Manager', 'Community Manager', 'Events & Promotions Coordinator'] },
  { name: 'Customer Support', icon: 'ri-customer-service-2-fill', color: 'text-sky-600', bg: 'bg-sky-50', positions: ['Customer Service Manager', 'Customer Care Representative', 'Call Centre Agent', 'Live Chat Support Agent', 'Client Success Officer', 'Complaint Resolution Officer'] },
  { name: 'Property & Real Estate', icon: 'ri-building-4-fill', color: 'text-teal-600', bg: 'bg-teal-50', positions: ['Head of Property Management', 'Property Manager', 'Property Inspector', 'Property Listing Officer', 'Property Photographer', 'Real Estate Agent', 'Letting Agent', 'Valuation Officer', 'Leasing Officer', 'Land Acquisition Officer', 'Property Maintenance Coordinator', 'Caretaker Coordinator'] },
  { name: 'Marketplace Operations', icon: 'ri-store-2-fill', color: 'text-orange-600', bg: 'bg-orange-50', positions: ['Marketplace Manager', 'Vendor Relations Officer', 'Product Verification Officer', 'Category Manager', 'Merchant Support Officer', 'Inventory Coordinator'] },
  { name: 'Airbnb & Hospitality', icon: 'ri-hotel-fill', color: 'text-indigo-600', bg: 'bg-indigo-50', positions: ['Airbnb Manager', 'Reservations Officer', 'Guest Relations Officer', 'Housekeeping Supervisor', 'Housekeepers', 'Maintenance Technician', 'Cleaning Staff'] },
  { name: 'Logistics & Field Operations', icon: 'ri-truck-fill', color: 'text-yellow-600', bg: 'bg-yellow-50', positions: ['Operations Manager', 'Field Operations Officer', 'Driver', 'Rider/Courier', 'Dispatch Coordinator', 'Fleet Manager'] },
  { name: 'Legal & Compliance', icon: 'ri-scales-3-fill', color: 'text-gray-700', bg: 'bg-gray-100', positions: ['Legal Counsel', 'Compliance Officer', 'Company Secretary', 'Contracts Officer', 'Data Protection Officer'] },
  { name: 'Research & Analytics', icon: 'ri-bar-chart-2-fill', color: 'text-cyan-600', bg: 'bg-cyan-50', positions: ['Research Officer', 'Market Research Analyst', 'Business Intelligence Analyst', 'Data Analyst'] },
  { name: 'Media & Communications', icon: 'ri-broadcast-fill', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', positions: ['Public Relations Officer', 'Communications Officer', 'Media Relations Officer', 'Corporate Affairs Manager'] },
  { name: 'Security', icon: 'ri-shield-user-fill', color: 'text-slate-600', bg: 'bg-slate-100', positions: ['Security Manager', 'Security Guards', 'CCTV Monitoring Officer'] },
  { name: 'Maintenance', icon: 'ri-tools-fill', color: 'text-amber-700', bg: 'bg-amber-50', positions: ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'General Maintenance Technician'] },
  { name: 'Cleaning Services', icon: 'ri-sparkling-2-fill', color: 'text-green-600', bg: 'bg-green-50', positions: ['Cleaner', 'Office Cleaner', 'Groundskeeper'] },
  { name: 'Internship & Graduate Programme', icon: 'ri-graduation-cap-fill', color: 'text-blue-500', bg: 'bg-blue-50', positions: ['Marketing Intern', 'Software Development Intern', 'Graphic Design Intern', 'Customer Support Intern', 'HR Intern', 'Finance Intern', 'Sales Intern'] },
  { name: 'Commission-Based Opportunities', icon: 'ri-percent-fill', color: 'text-emerald-700', bg: 'bg-emerald-50', positions: ['Property Marketing Agents', 'Field Marketing Agents', 'Referral Agents', 'Affiliate Marketers', 'Freelance Content Creators', 'Freelance Photographers'] },
  { name: 'Volunteer Positions', icon: 'ri-heart-fill', color: 'text-rose-500', bg: 'bg-rose-50', positions: ['Community Ambassadors', 'Campus Ambassadors', 'Brand Ambassadors'] },
];

type ApplyForm = { fullName: string; phone: string; email: string; cv: File | null };
const emptyForm: ApplyForm = { fullName: '', phone: '', email: '', cv: null };

export default function JobsPage() {
  const [selected, setSelected] = useState<{ position: string; department: string } | null>(null);
  const [form, setForm] = useState<ApplyForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const totalPositions = departments.reduce((s, d) => s + d.positions.length, 0);

  const filtered = search.trim()
    ? departments.map(d => ({ ...d, positions: d.positions.filter(p => p.toLowerCase().includes(search.toLowerCase())) })).filter(d => d.positions.length > 0)
    : departments;

  const openModal = (position: string, department: string) => {
    setSelected({ position, department });
    setForm(emptyForm);
    setSuccess(false);
    setError('');
  };

  const closeModal = () => { setSelected(null); setSuccess(false); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');

    let cvUrl: string | null = null;
    if (form.cv) {
      const ext = form.cv.name.split('.').pop();
      const path = `cvs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('job-applications').upload(path, form.cv);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('job-applications').getPublicUrl(path);
        cvUrl = urlData.publicUrl;
      }
      // If upload fails (e.g. bucket not set up yet), continue without CV
    }

    const { error: dbError } = await supabase.from('job_applications').insert({
      full_name: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      position: selected!.position,
      department: selected!.department,
      cv_url: cvUrl,
    });

    if (dbError) {
      setError('Submission failed: ' + dbError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  };

  return (
    <>
      <SEO title="Careers at NyumbaniLink" description="Join the NyumbaniLink team. We are looking for passionate volunteers across technology, real estate, marketing, and more." />

      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-600 pt-24 pb-12 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">🚀 We're Growing</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Join NyumbaniLink</h1>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed mb-2">
            NyumbaniLink is expanding into a complete real estate, marketplace, rental, Airbnb, jobs, and digital services platform.
          </p>
          <p className="text-white/80 text-sm mb-6">
            We are currently looking for <span className="font-bold text-white">volunteers</span> to help build something great. As we grow, we will start paying out. Be part of the journey from the start.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-extrabold">{totalPositions}+</p>
              <p className="text-emerald-200 text-xs">Open Positions</p>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <p className="text-2xl font-extrabold">{departments.length}</p>
              <p className="text-emerald-200 text-xs">Departments</p>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <p className="text-2xl font-extrabold">🇰🇪</p>
              <p className="text-emerald-200 text-xs">Kenya-Based</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
        <p className="text-amber-800 text-sm font-medium">
          <i className="ri-information-line mr-1.5"></i>
          All current positions are <strong>volunteer roles</strong>. As NyumbaniLink grows and generates revenue, compensation will be introduced. Early volunteers will be prioritised.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
          <i className="ri-search-line text-gray-400"></i>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search positions e.g. Software Engineer, Marketing..."
            className="flex-1 text-sm outline-none bg-transparent text-gray-700"
          />
          {search && <button onClick={() => setSearch('')} className="text-gray-400 cursor-pointer"><i className="ri-close-line"></i></button>}
        </div>
      </div>

      {/* Departments & Positions */}
      <div className="max-w-4xl mx-auto px-4 pb-28 space-y-5">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">No positions found for "{search}"</div>
        )}
        {filtered.map(dept => (
          <div key={dept.name} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className={`flex items-center gap-3 px-5 py-4 ${dept.bg} border-b border-gray-100`}>
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm flex-shrink-0">
                <i className={`${dept.icon} ${dept.color} text-lg`}></i>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">{dept.name}</h2>
                <p className="text-xs text-gray-500">{dept.positions.length} position{dept.positions.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {dept.positions.map(pos => (
                <div key={pos} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{pos}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">Volunteer · Remote/On-site</p>
                  </div>
                  <button
                    onClick={() => openModal(pos, dept.name)}
                    className="flex-shrink-0 ml-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 px-0 md:px-4" onClick={closeModal}>
          <div
            className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto md:hidden"></div>

            {success ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <i className="ri-checkbox-circle-fill text-emerald-600 text-3xl"></i>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Application Submitted!</h3>
                <p className="text-sm text-gray-500">
                  Thank you for applying for <span className="font-semibold text-gray-700">{selected.position}</span>. We'll be in touch soon.
                </p>
                <button onClick={closeModal} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">{selected.department}</p>
                  <h3 className="font-bold text-gray-900 text-lg mt-0.5">{selected.position}</h3>
                  <p className="text-xs text-gray-400 mt-1">Volunteer position · NyumbaniLink</p>
                </div>

                {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Full Name *</label>
                    <input
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. John Kamau"
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Phone Number *</label>
                    <input
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      type="tel"
                      placeholder="+254 7XX XXX XXX"
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Email Address *</label>
                    <input
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      type="email"
                      placeholder="you@email.com"
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                      Upload CV <span className="font-normal text-gray-400">(PDF, DOC — optional)</span>
                    </label>
                    <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-xl px-4 py-3 cursor-pointer transition-colors">
                      <i className="ri-upload-cloud-2-line text-gray-400 text-xl flex-shrink-0"></i>
                      <span className="text-sm text-gray-500 truncate">
                        {form.cv ? form.cv.name : 'Click to upload your CV'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={e => setForm({ ...form, cv: e.target.files?.[0] ?? null })}
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full font-bold text-sm py-3.5 rounded-xl transition-colors ${submitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
