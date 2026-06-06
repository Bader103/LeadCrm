import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Mon', leads: 40, conversions: 24 },
  { name: 'Tue', leads: 30, conversions: 13 },
  { name: 'Wed', leads: 20, conversions: 98 },
  { name: 'Thu', leads: 27, conversions: 39 },
  { name: 'Fri', leads: 18, conversions: 48 },
  { name: 'Sat', leads: 23, conversions: 38 },
  { name: 'Sun', leads: 34, conversions: 43 },
];

const sourceData = [
  { name: 'Website', value: 400 },
  { name: 'Referral', value: 300 },
  { name: 'Social', value: 300 },
  { name: 'Cold Call', value: 200 },
];

const COLORS = ['#10b981', '#34d399', '#059669', '#065f46'];

export const PipelineChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
      <Tooltip 
        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
        itemStyle={{ color: 'white' }}
      />
      <Area type="monotone" dataKey="leads" stroke="var(--primary)" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={3} />
    </AreaChart>
  </ResponsiveContainer>
);

export const SourceChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip 
        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
      />
    </PieChart>
  </ResponsiveContainer>
);
