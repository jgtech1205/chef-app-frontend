import {
  List,
  Datagrid,
  TextField,
  DateField,
  ChipField,
  SearchInput,
  SelectInput,
  EditButton,
  ShowButton,
  BooleanField,
  NumberField,
  ReferenceField,
} from 'react-admin';

const restaurantFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="status"
    choices={[
      { id: 'trial', name: 'Trial' },
      { id: 'active', name: 'Active' },
      { id: 'suspended', name: 'Suspended' },
      { id: 'cancelled', name: 'Cancelled' },
    ]}
  />,
  <SelectInput
    source="planType"
    choices={[
      { id: 'trial', name: 'Trial' },
      { id: 'pro', name: 'Pro' },
      { id: 'enterprise', name: 'Enterprise' },
    ]}
  />,
];

const StatusChip = ({ record }: any) => {
  const colors: Record<string, string> = {
    trial: '#3b82f6',
    active: '#10b981',
    suspended: '#f59e0b',
    cancelled: '#ef4444',
  };
  
  return (
    <ChipField
      source="status"
      record={record}
      style={{
        backgroundColor: colors[record?.status] || '#6b7280',
        color: 'white',
        textTransform: 'capitalize',
      }}
    />
  );
};

const PlanChip = ({ record }: any) => {
  const colors: Record<string, string> = {
    trial: '#3b82f6',
    pro: '#8b5cf6',
    enterprise: '#f97316',
  };
  
  return (
    <ChipField
      source="settings.planType"
      record={record}
      style={{
        backgroundColor: colors[record?.settings?.planType] || '#6b7280',
        color: 'white',
        textTransform: 'capitalize',
      }}
    />
  );
};

const TrialExpiry = ({ record }: any) => {
  if (record?.status !== 'trial') return null;
  
  const trialEnd = new Date(record.trialEndDate);
  const now = new Date();
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const color = daysLeft <= 3 ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#10b981';
  
  return (
    <span style={{ color, fontWeight: 'bold' }}>
      {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
    </span>
  );
};

export const RestaurantList = () => (
  <List
    filters={restaurantFilters}
    sort={{ field: 'createdAt', order: 'DESC' }}
    perPage={25}
  >
    <Datagrid rowClick="show">
      <TextField source="name" label="Restaurant Name" />
      <TextField source="organizationId" label="Organization ID" />
      <TextField source="type" label="Type" style={{ textTransform: 'capitalize' }} />
      
      <TextField source="headChef.name" label="Head Chef" />
      <TextField source="headChef.email" label="Email" />
      
      <StatusChip label="Status" />
      <PlanChip label="Plan" />
      
      <NumberField source="settings.maxRecipes" label="Recipe Limit" />
      <NumberField source="settings.maxTeamMembers" label="Team Limit" />
      
      <TrialExpiry label="Trial Status" />
      <DateField source="createdAt" label="Created" showTime />
      
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
);