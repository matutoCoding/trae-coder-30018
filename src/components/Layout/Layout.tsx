import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '数据概览', subtitle: '今日在办订单与业务统计' },
  '/orders': { title: '治丧接单', subtitle: '白事登记、历史记录与择吉时辰' },
  '/orders/new': { title: '新建接单', subtitle: '登记逝者信息与家属需求' },
  '/scheduling': { title: '执事排班', subtitle: '人员调度、抬棺编组与出殡路线' },
  '/scheduling/staff': { title: '人员档案', subtitle: '执事人员信息管理' },
  '/rituals': { title: '民俗流程', subtitle: '各地治丧礼仪模板与步骤' },
  '/materials': { title: '物资管理', subtitle: '孝服、纸扎、香烛库存管理' },
  '/materials/inventory': { title: '出入库记录', subtitle: '物资进出登记与盘点' },
  '/band': { title: '乐队安排', subtitle: '唢呐乐队管理与演出排班' },
  '/communication': { title: '客户沟通', subtitle: '家属需求记录与跟进' },
  '/settlement': { title: '结算分账', subtitle: '费用明细与人员分账' },
  '/settlement/reports': { title: '财务报表', subtitle: '收支汇总与利润分析' },
};

export default function Layout() {
  const location = useLocation();
  let pageInfo = pageTitles[location.pathname];
  if (!pageInfo) {
    if (location.pathname.startsWith('/orders/')) {
      pageInfo = { title: '订单详情', subtitle: '查看订单完整信息与处理进度' };
    } else {
      pageInfo = {
        title: '孝思堂管理系统',
        subtitle: '殡葬白事执事司仪团队管理平台',
      };
    }
  }

  return (
    <div className="flex min-h-screen bg-pattern-cloud">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="flex-1 p-6 overflow-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
