import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

interface NavItem { label: string; 
  icon: string; 
  route: string;
   roles: string[]; 
   queryParams?: Record<string, string>; }

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.css'
})
export class DashboardShellComponent implements OnInit {
  private auth = inject(AuthService);

  user      = this.auth.getUser();
  userInitial = (this.user?.name || 'U')[0].toUpperCase();
  roleLabel = this.getRoleLabel();

  private allNav: NavItem[] = [
    // CITIZEN
    { label:'My Dashboard',   icon:'bi-house-door',       route:'/dashboard/citizen',    roles:['CITIZEN'] },
    { label:'My Profile',     icon:'bi-person-circle',    route:'/dashboard/profile',    roles:['CITIZEN'] },
    // DOCTOR / NURSE
    { label:'Clinical Dashboard', icon:'bi-house-door',   route:'/dashboard/doctor',     roles:['DOCTOR','NURSE'] },
    // DISPATCHER
    { label:'Dispatch Board', icon:'bi-truck-front',      route:'/dashboard/dispatcher', roles:['DISPATCHER'] },
    // ADMIN
    { label:'Overview',       icon:'bi-speedometer2',     route:'/dashboard/admin',      roles:['ADMIN'], queryParams: { tab: 'overview' } },
    { label:'Facilities',     icon:'bi-building',         route:'/dashboard/admin',      roles:['ADMIN'], queryParams: { tab: 'facilities' } },
    { label:'Patients',       icon:'bi-people',           route:'/dashboard/admin',      roles:['ADMIN'], queryParams: { tab: 'patients' } },
    { label:'Ambulances',     icon:'bi-truck',            route:'/dashboard/admin',      roles:['ADMIN'], queryParams: { tab: 'ambulances' } },
    { label:'Staff',          icon:'bi-person-badge',     route:'/dashboard/admin',      roles:['ADMIN'], queryParams: { tab: 'staff' } },
    { label:'Users',          icon:'bi-people-fill',      route:'/dashboard/admin',      roles:['ADMIN'], queryParams: { tab: 'users' } },
    { label:'Documents',      icon:'bi-file-earmark-check', route:'/dashboard/admin',    roles:['ADMIN'], queryParams: { tab: 'documents' } },
    // COMPLIANCE
    { label:'Records',        icon:'bi-file-earmark-text', route:'/dashboard/compliance', roles:['COMPLIANCE_OFFICER','CITY_HEALTH_OFFICER'], queryParams:{ tab: 'records' } },
    { label:'Audits',         icon:'bi-clipboard2-check', route:'/dashboard/compliance', roles:['COMPLIANCE_OFFICER','CITY_HEALTH_OFFICER'], queryParams:{ tab: 'audits' } },
    { label:'Logs',           icon:'bi-journal-text', route:'/dashboard/compliance', roles:['COMPLIANCE_OFFICER','CITY_HEALTH_OFFICER'], queryParams:{ tab: 'logs' } },
  ];

  get visibleNav() {
    const role = this.auth.getRole() || '';
    return this.allNav.filter(n => n.roles.includes(role));
  }

  get pageTitle() {
    const role = this.auth.getRole() || '';
    const map: Record<string,string> = {
      CITIZEN:'My Health Dashboard', DOCTOR:'Clinical Dashboard', NURSE:'Clinical Dashboard',
      DISPATCHER:'Dispatch Control', ADMIN:'Admin Panel', COMPLIANCE_OFFICER:'Compliance Center'
    };
    return map[role] || 'CityCare';
  }

  getRoleLabel() {
    const map: Record<string,string> = {
      CITIZEN:'Citizen', DOCTOR:'Doctor', NURSE:'Nurse',
      DISPATCHER:'Dispatcher', ADMIN:'Administrator',
      COMPLIANCE_OFFICER:'Compliance Officer'
    };
    return map[this.auth.getRole() || ''] || '';
  }

  get themeClass() {
    const role = this.auth.getRole() || '';
    switch(role) {
      case 'ADMIN': return 'theme-admin';
      case 'DOCTOR':
      case 'NURSE': return 'theme-clinical';
      case 'DISPATCHER': return 'theme-dispatch';
      case 'COMPLIANCE_OFFICER':
      case 'CITY_HEALTH_OFFICER': return 'theme-compliance';
      case 'CITIZEN': return 'theme-citizen';
      default: return '';
    }
  }

  ngOnInit() {}

  logout() { this.auth.logout(); }
}