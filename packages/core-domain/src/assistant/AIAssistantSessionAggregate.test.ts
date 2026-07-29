import { describe, it, expect } from 'vitest';
import { AIAssistantSessionAggregate } from './AIAssistantSessionAggregate.js';

describe('AIAssistantSessionAggregate', () => {
  it('should create an AI assistant session aggregate successfully', () => {
    const result = AIAssistantSessionAggregate.create({
      tenantId: 'TENANT-001',
      title: 'Procurement Strategy Chat',
      mode: 'procurement_advisor',
    });

    expect(result.isSuccess).toBe(true);
    const session = result.getValue();
    expect(session.props.tenantId).toBe('TENANT-001');
    expect(session.props.title).toBe('Procurement Strategy Chat');
    expect(session.props.mode).toBe('procurement_advisor');
    expect(session.props.messages).toHaveLength(0);
    expect(session.props.isArchived).toBe(false);
  });

  it('should fail creation if tenantId or title is missing', () => {
    const res1 = AIAssistantSessionAggregate.create({
      tenantId: '',
      title: 'Valid Title',
      mode: 'general_chat',
    });
    expect(res1.isSuccess).toBe(false);
    expect(res1.error).toContain('Tenant ID is required');

    const res2 = AIAssistantSessionAggregate.create({
      tenantId: 'TENANT-001',
      title: '',
      mode: 'general_chat',
    });
    expect(res2.isSuccess).toBe(false);
    expect(res2.error).toContain('title is required');
  });

  it('should add messages and update timestamp', () => {
    const session = AIAssistantSessionAggregate.create({
      tenantId: 'TENANT-001',
      title: 'New Conversation',
      mode: 'rfq_writer',
    }).getValue();

    const addRes = session.addMessage({
      role: 'user',
      content: 'Draft an RFQ for 500 units of Titanium Grade 5 fasteners.',
    });

    expect(addRes.isSuccess).toBe(true);
    expect(session.props.messages).toHaveLength(1);
    expect(session.props.messages[0].content).toContain('Titanium Grade 5');
    expect(session.props.title).toContain('Draft an RFQ for 500 units');
  });
});
