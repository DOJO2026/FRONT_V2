import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layout/layouts/main-layout/main-layout';
import { HomeComponent } from './features/chat/pages/home/home';
import { DesignSystemComponent } from './features/playground/pages/design-system/design-system';
import { AnalyticsDashboardComponent } from './features/analytics/pages/analytics-dashboard/analytics-dashboard';
import { KnowledgeBaseComponent } from './features/knowledge/pages/knowledge-base/knowledge-base.component';
import { HistoryDashboardComponent } from './features/history/pages/history-dashboard/history-dashboard.component';
import { ClaimsDashboardComponent } from './features/claims/pages/claims-dashboard/claims-dashboard.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                component: HomeComponent
            },
            {
                path: 'claims',
                component: ClaimsDashboardComponent
            },
            {
                path: 'reclamos',
                redirectTo: 'claims',
                pathMatch: 'full'
            },
            {
                path: 'knowledge',
                component: KnowledgeBaseComponent
            },
            {
                path: 'history',
                component: HistoryDashboardComponent
            },
            {
                path: 'analytics',
                component: AnalyticsDashboardComponent
            },
            {
                path: 'design-system',
                component: DesignSystemComponent
            }
        ]
    }
];