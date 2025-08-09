import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  ChipField,
  NumberField,
  BooleanField,
  TabbedShowLayout,
  Tab,
  ReferenceManyField,
  Datagrid,
  EmailField,
} from 'react-admin';

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

export const RestaurantShow = () => (
  <Show>
    <TabbedShowLayout>
      <Tab label="Restaurant Details">
        <TextField source="name" label="Restaurant Name" />
        <TextField source="organizationId" label="Organization ID" />
        <TextField source="type" label="Restaurant Type" style={{ textTransform: 'capitalize' }} />
        
        <StatusChip label="Status" />
        <PlanChip label="Current Plan" />
        
        <DateField source="createdAt" label="Created At" showTime />
        <DateField source="updatedAt" label="Last Updated" showTime />
      </Tab>

      <Tab label="Head Chef">
        <TextField source="headChef.name" label="Name" />
        <EmailField source="headChef.email" label="Email" />
        <TextField source="headChef.role" label="Role" />
        <BooleanField source="headChef.emailVerified" label="Email Verified" />
        <DateField source="headChef.createdAt" label="Account Created" showTime />
      </Tab>

      <Tab label="Plan & Limits">
        <PlanChip label="Plan Type" />
        <NumberField source="settings.maxRecipes" label="Recipe Limit" />
        <NumberField source="settings.maxTeamMembers" label="Team Member Limit" />
        
        {/* Trial Information */}
        <DateField source="trialStartDate" label="Trial Started" showTime />
        <DateField source="trialEndDate" label="Trial Ends" showTime />
      </Tab>

      <Tab label="Location">
        <TextField source="location.address" label="Address" />
        <TextField source="location.city" label="City" />
        <TextField source="location.state" label="State" />
        <TextField source="location.zipCode" label="ZIP Code" />
        <TextField source="location.country" label="Country" />
      </Tab>

      <Tab label="Subscription" path="subscription">
        {/* Subscription details would go here */}
        <TextField source="subscription.planType" label="Subscription Plan" />
        <TextField source="subscription.status" label="Subscription Status" />
        <DateField source="subscription.currentPeriodStart" label="Current Period Start" />
        <DateField source="subscription.currentPeriodEnd" label="Current Period End" />
        <NumberField 
          source="subscription.pricing.amount" 
          label="Amount (cents)" 
          transform={(value: number) => `$${(value / 100).toFixed(2)}`}
        />
      </Tab>
    </TabbedShowLayout>
  </Show>
);