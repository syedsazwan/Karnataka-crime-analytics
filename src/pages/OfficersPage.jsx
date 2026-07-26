import React, { useState } from 'react';
import { ShieldCheck, Mail, Phone, MapPin, Search, Filter } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { KARNATAKA_DISTRICTS } from '../utils/constants';

export const OFFICERS_LIST = [
  {
    id: 'OFF001',
    name: 'Ins. Rajesh Gowda',
    rank: 'Inspector',
    department: 'Cyber Crime Lead',
    district: 'Bengaluru City',
    email: 'r.gowda@ksp.gov.in',
    phone: '+91 98450 12345',
    status: 'Active',
    initials: 'GO'
  },
  {
    id: 'OFF002',
    name: 'Ins. Shilpa Patil',
    rank: 'Inspector',
    department: 'Law & Order Inspector',
    district: 'Mysuru',
    email: 's.patil@ksp.gov.in',
    phone: '+91 98450 67890',
    status: 'On Duty',
    initials: 'PA'
  },
  {
    id: 'OFF003',
    name: 'Det. A. Kulkarni',
    rank: 'Detective Inspector',
    department: 'Special Investigations',
    district: 'Belagavi',
    email: 'a.kulkarni@ksp.gov.in',
    phone: '+91 98450 11223',
    status: 'Active',
    initials: 'KU'
  },
  {
    id: 'OFF004',
    name: 'Ins. Rohan Shetty',
    rank: 'Inspector',
    department: 'Narcotics Division',
    district: 'Mangaluru',
    email: 'r.shetty@ksp.gov.in',
    phone: '+91 98450 44556',
    status: 'On Duty',
    initials: 'SH'
  },
  {
    id: 'OFF005',
    name: 'Ins. Sunil Kumar',
    rank: 'Inspector',
    department: 'General Crimes Cell',
    district: 'Kalaburagi',
    email: 's.kumar@ksp.gov.in',
    phone: '+91 98450 77889',
    status: 'Leave',
    initials: 'KU'
  },
  {
    id: 'OFF006',
    name: 'Ins. V. Hiremath',
    rank: 'Inspector',
    department: 'Traffic & Safety',
    district: 'Hubballi-Dharwad',
    email: 'v.hiremath@ksp.gov.in',
    phone: '+91 98450 99001',
    status: 'Active',
    initials: 'HI'
  },
  {
    id: 'OFF007',
    name: 'Ins. Priya Sharma',
    rank: 'Inspector',
    department: 'Women & Child Safety',
    district: 'Tumakuru',
    email: 'p.sharma@ksp.gov.in',
    phone: '+91 98450 33445',
    status: 'Active',
    initials: 'SH'
  },
  {
    id: 'OFF008',
    name: 'Ins. Anand Rao',
    rank: 'Inspector',
    department: 'Economic Offences',
    district: 'Bengaluru Dist',
    email: 'a.rao@ksp.gov.in',
    phone: '+91 98450 55667',
    status: 'On Duty',
    initials: 'RA'
  }
];

export const OfficersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const filteredOfficers = OFFICERS_LIST.filter(officer => {
    const matchDistrict = selectedDistrict === 'All' || officer.district === selectedDistrict;
    const matchSearch = !searchQuery ||
      officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDistrict && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="gov-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Officers Registry</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Karnataka State Police commanding officers & sector leads</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search officer name, dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0F172A] border border-[#334155] text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-[#0F172A] border border-[#334155] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="All">All Districts</option>
            {KARNATAKA_DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Officer Cards matching Screenshot 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOfficers.map((officer) => (
          <div
            key={officer.id}
            className="gov-card p-5 relative group hover:border-blue-500/50 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Officer Initials Avatar */}
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-sm shadow-md">
                  {officer.initials}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white group-hover:text-blue-400 transition-colors">
                    {officer.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-medium">{officer.department}</div>
                </div>
              </div>

              <StatusBadge status={officer.status} />
            </div>

            <div className="mt-4 pt-4 border-t border-[#334155] space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{officer.district}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{officer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{officer.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
