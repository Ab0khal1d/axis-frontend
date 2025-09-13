/**
 * Mock data for conversations
 */
import type { Message } from '../components/chat/types';

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  pinned?: boolean;
}

// Generate a set of mock conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Product Roadmap Planning',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),  // 2 hours ago
    pinned: true,
    messages: [
      {
        id: 'msg-1-1',
        role: 'user',
        content: 'I need help planning our Q4 product roadmap.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-1-2',
        role: 'ai',
        content: 'I\'d be happy to help with your Q4 product roadmap planning. To get started, could you share your key business goals for the quarter and any major constraints (budget, time, resources) that we should consider?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 30000),
      },
      {
        id: 'msg-1-3',
        role: 'user',
        content: 'Our main goal is to increase user engagement by 20%. We have a dev team of 5 engineers and 2 designers. Budget is somewhat limited.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'msg-1-4',
        role: 'ai',
        content: 'Given your goal of increasing user engagement by 20% with a small team and limited budget, I suggest focusing on high-impact, low-resource features. Consider implementing: 1) Personalized notifications to bring users back, 2) A simplified onboarding flow to reduce friction, 3) One key social feature to drive network effects. Would you like me to elaborate on any of these suggestions?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000),
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Marketing Strategy Analysis',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: 'msg-2-1',
        role: 'user',
        content: 'Can you analyze our marketing performance from last quarter?',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-2-2',
        role: 'ai',
        content: 'I\'d be happy to help analyze your marketing performance. Could you provide some key metrics from last quarter, such as campaign results, budget allocation, conversion rates, or customer acquisition costs?',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 25000),
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Customer Feedback Analysis',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    messages: [
      {
        id: 'msg-3-1',
        role: 'user',
        content: 'We received a lot of customer feedback this month. Can you help me organize it into themes?',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-3-2',
        role: 'ai',
        content: 'I\'d be happy to help organize your customer feedback into themes. Could you share the feedback data with me, or describe the types of feedback you\'ve been receiving?',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 20000),
      },
      {
        id: 'msg-3-3',
        role: 'user',
        content: 'Most feedback is related to our new checkout process, mobile app performance, and customer support response times.',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-3-4',
        role: 'ai',
        content: 'Based on the feedback areas you mentioned, I suggest organizing them into these primary themes:\n\n1. **Checkout Experience**\n- Ease of use\n- Payment options\n- Technical issues\n\n2. **Mobile App Performance**\n- Speed & responsiveness\n- Crashes & bugs\n- Feature functionality\n\n3. **Customer Support**\n- Response time\n- Resolution quality\n- Communication clarity\n\nWould you like me to create a more detailed analysis framework for each theme?',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 35000),
      },
    ],
  },
  {
    id: 'conv-4',
    title: 'Competitor Research',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    pinned: true,
    messages: [
      {
        id: 'msg-4-1',
        role: 'user',
        content: 'I need to research our top 3 competitors. Where should I start?',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-4-2',
        role: 'ai',
        content: 'Researching competitors effectively requires a structured approach. I suggest starting with these key areas:\n\n1. **Product Comparison**\n- Feature analysis\n- Pricing structures\n- Unique selling propositions\n\n2. **Market Positioning**\n- Brand messaging\n- Target audience\n- Marketing channels\n\n3. **Customer Experience**\n- User reviews & ratings\n- Customer support quality\n- Onboarding process\n\nWould you like me to elaborate on any specific area to help guide your research?',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 40000),
      },
      {
        id: 'msg-4-3',
        role: 'user',
        content: 'This is helpful. Can you suggest tools or resources for gathering this competitive intelligence?',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-4-4',
        role: 'ai',
        content: 'Here are some valuable tools and resources for gathering competitive intelligence:\n\n**Product Analysis:**\n- Product Hunt (new features and launches)\n- G2 and Capterra (detailed feature comparisons)\n- Built With (tech stack insights)\n\n**Market Positioning:**\n- SimilarWeb (traffic and audience data)\n- SpyFu or SEMrush (SEO and ad strategies)\n- Social Blade (social media presence)\n\n**Customer Experience:**\n- App/Play Store reviews\n- Trustpilot and BBB\n- Reddit and industry forums\n\n**Financial Insights (if applicable):**\n- Annual reports (for public companies)\n- Crunchbase (funding data)\n- LinkedIn (employee growth trends)\n\nWould you like more information about any specific tool?',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 35000),
      },
    ],
  },
  {
    id: 'conv-5',
    title: 'Financial Forecast',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: 'msg-5-1',
        role: 'user',
        content: 'I need to create a financial forecast for our startup. What should I include?',
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-5-2',
        role: 'ai',
        content: 'Creating a comprehensive financial forecast for your startup should include these key components:\n\n1. **Revenue Projections**\n- Customer acquisition estimates\n- Pricing model and revenue streams\n- Growth rate assumptions\n\n2. **Cost Structure**\n- Fixed costs (rent, salaries, subscriptions)\n- Variable costs (COGS, marketing)\n- One-time expenses (equipment, setup)\n\n3. **Cash Flow Analysis**\n- Burn rate calculation\n- Runway estimation\n- Cash flow timing (accounting for payment terms)\n\n4. **Key Financial Statements**\n- Projected P&L statement\n- Balance sheet forecast\n- Cash flow statement\n\n5. **Sensitivity Analysis**\n- Best/worst/likely scenarios\n- Break-even analysis\n\nWould you like me to go deeper on any particular aspect?',
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 40000),
      },
    ],
  },
  {
    id: 'conv-6',
    title: 'New Website Design',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updatedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
    messages: [
      {
        id: 'msg-6-1',
        role: 'user',
        content: 'We\'re redesigning our company website. What are the key elements we should focus on?',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-6-2',
        role: 'ai',
        content: 'For a company website redesign, here are the key elements to focus on:\n\n1. **User-Centered Navigation**\n- Intuitive menu structure\n- Clear information hierarchy\n- Streamlined user journeys\n\n2. **Compelling Value Proposition**\n- Clear messaging above the fold\n- Problem-solution framing\n- Industry-specific differentiation\n\n3. **Conversion Optimization**\n- Strategic CTAs\n- Simplified forms\n- Reduced friction points\n\n4. **Modern Design Elements**\n- Mobile responsiveness\n- Appropriate white space\n- Visual consistency with brand\n\n5. **Performance & Accessibility**\n- Fast loading speed\n- ADA compliance\n- Cross-browser compatibility\n\nWould you like recommendations for any specific section of your website?',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 38000),
      },
      {
        id: 'msg-6-3',
        role: 'user',
        content: 'This is helpful. What are some current website design trends we should consider incorporating?',
        timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-6-4',
        role: 'ai',
        content: 'Here are current website design trends worth considering for your redesign:\n\n1. **Minimalist Navigation**\n- Hamburger menus on all devices\n- Hidden navigation that appears on scroll\n- Simplified mega menus\n\n2. **Visual Elements**\n- Bold, oversized typography\n- Custom illustrations over stock photos\n- Subtle animations and micro-interactions\n- 3D elements and depth\n\n3. **Layout Innovations**\n- Asymmetrical layouts\n- Horizontal scrolling sections\n- Split-screen designs\n- Overlapping elements\n\n4. **Technical Enhancements**\n- Dark mode options\n- Voice user interfaces\n- AR/VR product experiences\n- AI-powered personalization\n\n5. **Content Presentation**\n- Scrollytelling (narrative as you scroll)\n- Interactive infographics\n- Video backgrounds\n- User-generated content integration\n\nAny particular trend you\'d like to explore further?',
        timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000 + 45000),
      },
    ],
  },
  {
    id: 'conv-7',
    title: 'Employee Onboarding Process',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: 'msg-7-1',
        role: 'user',
        content: 'We need to improve our employee onboarding process. Any recommendations?',
        timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-7-2',
        role: 'ai',
        content: 'Improving your employee onboarding process can significantly impact retention and productivity. Here are key recommendations:\n\n1. **Pre-Boarding**\n- Send welcome materials before start date\n- Provide access to key systems early\n- Assign an onboarding buddy\n\n2. **First Day Experience**\n- Prepare workstation completely\n- Schedule welcome lunch/team introduction\n- Limit overwhelming paperwork\n\n3. **First Week Structure**\n- Create clear agenda with objectives\n- Include time for relationship building\n- Balance training with actual work\n\n4. **First Month Plan**\n- Set clear 30/60/90 day goals\n- Schedule regular feedback sessions\n- Gradually increase responsibilities\n\n5. **Systematization**\n- Create digital checklists for consistency\n- Document process for different roles\n- Collect metrics and feedback\n\nWould you like me to elaborate on any specific area?',
        timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000 + 32000),
      },
    ],
  }
];

// Default conversation is null when no conversation is active (initial state or new chat)
export const defaultConversation: Conversation | null = null;