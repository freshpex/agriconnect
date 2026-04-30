import { createTrustScoreEvaluator } from "../services/nac/trustScore";

describe("trust score evaluator", () => {
  test("approves when all signals are positive", async () => {
    const evaluate = createTrustScoreEvaluator({
      checkSimSwap: jest.fn().mockResolvedValue({ swapped: false }),
      matchKyc: jest.fn().mockResolvedValue({
        nameMatch: "true",
        idDocumentMatch: "true",
      }),
      verifyLocation: jest.fn().mockResolvedValue({
        verificationResult: "TRUE",
        matchRate: 0.98,
      }),
    });

    const result = await evaluate({
      phoneNumber: "+2347000000000",
      kycData: {
        nationalId: "A1234567",
        fullName: "Ada Farmer",
        dateOfBirth: "1990-02-10",
      },
      location: { latitude: 6.45, longitude: 3.4, radius: 5000 },
      numberVerified: true,
    });

    expect(result.decision).toBe("approve");
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  test("reviews when data is missing", async () => {
    const evaluate = createTrustScoreEvaluator({
      checkSimSwap: jest.fn().mockResolvedValue({ swapped: false }),
      matchKyc: jest.fn(),
      verifyLocation: jest.fn(),
    });

    const result = await evaluate({
      phoneNumber: "+2347000000000",
      numberVerified: false,
    });

    expect(result.decision).toBe("review");
    expect(result.score).toBeGreaterThanOrEqual(40);
  });

  test("blocks when high-risk signals are present", async () => {
    const evaluate = createTrustScoreEvaluator({
      checkSimSwap: jest.fn().mockResolvedValue({ swapped: true }),
      matchKyc: jest.fn().mockResolvedValue({
        nameMatch: "false",
        idDocumentMatch: "false",
      }),
      verifyLocation: jest.fn().mockResolvedValue({
        verificationResult: "FALSE",
        matchRate: 0.1,
      }),
    });

    const result = await evaluate({
      phoneNumber: "+2347000000000",
      kycData: {
        nationalId: "A1234567",
        fullName: "Ada Farmer",
        dateOfBirth: "1990-02-10",
      },
      location: { latitude: 6.45, longitude: 3.4, radius: 5000 },
      numberVerified: false,
    });

    expect(result.decision).toBe("block");
    expect(result.score).toBeLessThan(40);
  });
});
