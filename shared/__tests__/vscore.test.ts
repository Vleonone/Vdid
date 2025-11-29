/**
 * V-Score Calculation Tests
 * 测试 V-Score 计算和等级判定
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTotalVScore,
  getVScoreLevel,
  getVScoreLevelDetails,
  VSCORE_WEIGHTS,
  VSCORE_LEVELS,
} from '../schema';

describe('V-Score System', () => {
  describe('VSCORE_WEIGHTS', () => {
    it('should have correct weight configuration', () => {
      expect(VSCORE_WEIGHTS.activity).toBe(0.30);
      expect(VSCORE_WEIGHTS.financial).toBe(0.35);
      expect(VSCORE_WEIGHTS.social).toBe(0.20);
      expect(VSCORE_WEIGHTS.trust).toBe(0.15);
    });

    it('should have weights that sum to 1', () => {
      const totalWeight =
        VSCORE_WEIGHTS.activity +
        VSCORE_WEIGHTS.financial +
        VSCORE_WEIGHTS.social +
        VSCORE_WEIGHTS.trust;

      expect(totalWeight).toBeCloseTo(1, 10);
    });
  });

  describe('VSCORE_LEVELS', () => {
    it('should have all level definitions', () => {
      expect(VSCORE_LEVELS.NEWCOMER).toBeDefined();
      expect(VSCORE_LEVELS.ACTIVE).toBeDefined();
      expect(VSCORE_LEVELS.ESTABLISHED).toBeDefined();
      expect(VSCORE_LEVELS.TRUSTED).toBeDefined();
      expect(VSCORE_LEVELS.ELITE).toBeDefined();
    });

    it('should have correct level thresholds', () => {
      expect(VSCORE_LEVELS.NEWCOMER.min).toBe(0);
      expect(VSCORE_LEVELS.ACTIVE.min).toBe(200);
      expect(VSCORE_LEVELS.ESTABLISHED.min).toBe(400);
      expect(VSCORE_LEVELS.TRUSTED.min).toBe(600);
      expect(VSCORE_LEVELS.ELITE.min).toBe(800);
    });
  });

  describe('calculateTotalVScore', () => {
    it('should calculate score with individual parameters', () => {
      // All zeros should give 0
      const score1 = calculateTotalVScore(0, 0, 0, 0);
      expect(score1).toBe(0);

      // Max scores (1000 each) should give 1000 total
      const score2 = calculateTotalVScore(1000, 1000, 1000, 1000);
      expect(score2).toBe(1000);
    });

    it('should calculate score with object parameter', () => {
      const score = calculateTotalVScore({
        activity: 100,
        financial: 100,
        social: 100,
        trust: 100,
      });

      // 100 * 0.30 + 100 * 0.35 + 100 * 0.20 + 100 * 0.15 = 100
      expect(score).toBe(100);
    });

    it('should apply correct weights', () => {
      // Only activity score
      const activityOnly = calculateTotalVScore(100, 0, 0, 0);
      expect(activityOnly).toBe(30); // 100 * 0.30

      // Only financial score
      const financialOnly = calculateTotalVScore(0, 100, 0, 0);
      expect(financialOnly).toBe(35); // 100 * 0.35

      // Only social score
      const socialOnly = calculateTotalVScore(0, 0, 100, 0);
      expect(socialOnly).toBe(20); // 100 * 0.20

      // Only trust score
      const trustOnly = calculateTotalVScore(0, 0, 0, 100);
      expect(trustOnly).toBe(15); // 100 * 0.15
    });

    it('should handle partial object parameters', () => {
      const score = calculateTotalVScore({
        activity: 500,
        financial: 200,
      });

      // 500 * 0.30 + 200 * 0.35 + 0 * 0.20 + 0 * 0.15 = 150 + 70 = 220
      expect(score).toBe(220);
    });

    it('should round to integer', () => {
      const score = calculateTotalVScore(333, 333, 333, 333);

      expect(Number.isInteger(score)).toBe(true);
    });
  });

  describe('getVScoreLevel', () => {
    it('should return Newcomer for scores 0-199', () => {
      expect(getVScoreLevel(0)).toBe('Newcomer');
      expect(getVScoreLevel(100)).toBe('Newcomer');
      expect(getVScoreLevel(199)).toBe('Newcomer');
    });

    it('should return Active for scores 200-399', () => {
      expect(getVScoreLevel(200)).toBe('Active');
      expect(getVScoreLevel(300)).toBe('Active');
      expect(getVScoreLevel(399)).toBe('Active');
    });

    it('should return Established for scores 400-599', () => {
      expect(getVScoreLevel(400)).toBe('Established');
      expect(getVScoreLevel(500)).toBe('Established');
      expect(getVScoreLevel(599)).toBe('Established');
    });

    it('should return Trusted for scores 600-799', () => {
      expect(getVScoreLevel(600)).toBe('Trusted');
      expect(getVScoreLevel(700)).toBe('Trusted');
      expect(getVScoreLevel(799)).toBe('Trusted');
    });

    it('should return Elite for scores 800+', () => {
      expect(getVScoreLevel(800)).toBe('Elite');
      expect(getVScoreLevel(900)).toBe('Elite');
      expect(getVScoreLevel(1000)).toBe('Elite');
    });
  });

  describe('getVScoreLevelDetails', () => {
    it('should return correct details for Newcomer', () => {
      const details = getVScoreLevelDetails(100);

      expect(details.level).toBe('Newcomer');
      expect(details.nextLevel).toBeDefined();
      expect(details.nextLevel?.level).toBe('Active');
      expect(details.nextLevel?.pointsNeeded).toBe(100);
    });

    it('should return correct details for Elite', () => {
      const details = getVScoreLevelDetails(1000);

      expect(details.level).toBe('Elite');
      expect(details.nextLevel).toBeUndefined();
    });

    it('should calculate correct points needed', () => {
      const details = getVScoreLevelDetails(350);

      expect(details.level).toBe('Active');
      expect(details.nextLevel?.level).toBe('Established');
      expect(details.nextLevel?.pointsNeeded).toBe(50); // 400 - 350
    });
  });
});
