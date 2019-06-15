import { checkIsLoggedIn, AuthLevels, checkIsVolunteer, checkIsOrganizer } from "../../../../src/util/user";
import { Request, Response, NextFunction } from "express";
import { mock, instance, reset, verify, when, spy } from "ts-mockito";
import { MockRequest, MockResponse } from "../../../util";
import { User } from "../../../../src/db/entity/hub";
import { MockSession } from "../../../util/mockSession";

let mockRequest: Request;
let mockResponse: Response;
let mockNext: NextFunction;
let mockUser: User;

let nextCalled: boolean;
let nextArgs: any[];

beforeAll((): void => {
    mockRequest = mock(MockRequest);
    mockResponse = mock(MockResponse);
    mockUser = mock(User);
    nextCalled = false;
    nextArgs = [];
    mockNext = (...args: any[]): void => {
        nextArgs = args;
        nextCalled = true;
    };
});

afterEach((): void => {
    reset(mockRequest);
    reset(mockResponse);
    reset(mockUser);

    nextCalled = false;
    nextArgs = [];
});

describe("Authorization tests", (): void => {
    describe("Test checkIsLoggedIn", (): void => {
        test("Should ensure that a user who is not logged in gets redirected to /login", (): void => {
            const mockRedirectURL: string = "testURL";
            when(mockRequest.session).thenReturn(new MockSession())
            when(mockRequest.originalUrl).thenReturn(mockRedirectURL);
            const mockRequestInstance: Request = instance(mockRequest);

            checkIsLoggedIn(mockRequestInstance, instance(mockResponse), mockNext);

            verify(mockRequest.originalUrl).once();
            expect(mockRequestInstance.session.redirectTo).toEqual(mockRedirectURL);
            expect(nextCalled).toBeFalsy();
            verify(mockResponse.redirect("/login")).once();
        });

        test("Should ensure that an attendee user is not given any extra permissions", (): void => {
            when(mockRequest.user).thenReturn({ authLevel: AuthLevels.Attendee });
            const mockResponseInstance: Response = instance(mockResponse);

            checkIsLoggedIn(instance(mockRequest), mockResponseInstance, mockNext);

            // Checking if any authorization permissions were granted
            expect(mockResponseInstance.locals).toBeNull();

            expect(nextCalled).toBeTruthy();
        });

        test("Should ensure that a volunteer user is given only volunteer permissions", (): void => {
            when(mockRequest.user).thenReturn({ authLevel: AuthLevels.Volunteer });
            when(mockResponse.locals).thenReturn({});
            const mockResponseInstance: Response = instance(mockResponse);

            checkIsLoggedIn(instance(mockRequest), mockResponseInstance, mockNext);

            expect(mockResponseInstance.locals.isVolunteer).toBeTruthy();
            expect(mockResponseInstance.locals.isOrganizer).toBeUndefined();

            expect(nextCalled).toBeTruthy();
        });

        test("Should ensure that an organizer user is given volunteer and organizer permissions", (): void => {
            when(mockRequest.user).thenReturn({ authLevel: AuthLevels.Organizer });
            when(mockResponse.locals).thenReturn({});
            const mockResponseInstance: Response = instance(mockResponse);

            checkIsLoggedIn(instance(mockRequest), mockResponseInstance, mockNext);

            expect(mockResponseInstance.locals.isVolunteer).toBeTruthy();
            expect(mockResponseInstance.locals.isOrganizer).toBeTruthy();

            expect(nextCalled).toBeTruthy();
        });
    });

    describe("Test checkIsVolunteer", (): void => {
        test("Should ensure that a user who is not logged in gets redirected to /login", (): void => {
            const mockRedirectURL: string = "testURL";
            when(mockRequest.session).thenReturn(new MockSession())
            when(mockRequest.originalUrl).thenReturn(mockRedirectURL);
            const mockRequestInstance: Request = instance(mockRequest);

            checkIsVolunteer(mockRequestInstance, instance(mockResponse), mockNext);

            verify(mockRequest.originalUrl).once();
            expect(mockRequestInstance.session.redirectTo).toEqual(mockRedirectURL);
            expect(nextCalled).toBeFalsy();
            verify(mockResponse.redirect("/login")).once();
        });

        test("Should ensure that an attendee user gets redirected to /login", (): void => {
            const mockRedirectURL: string = "testURL";
            when(mockRequest.session).thenReturn(new MockSession())
            when(mockRequest.originalUrl).thenReturn(mockRedirectURL);
            when(mockRequest.user).thenReturn({ authLevel: AuthLevels.Attendee });
            const mockRequestInstance: Request = instance(mockRequest);

            checkIsVolunteer(mockRequestInstance, instance(mockResponse), mockNext);

            verify(mockRequest.originalUrl).once();
            expect(mockRequestInstance.session.redirectTo).toEqual(mockRedirectURL);
            expect(nextCalled).toBeFalsy();
            verify(mockResponse.redirect("/login")).once();
        });

        test("Should ensure that a volunteer user is given only volunteer permissions", (): void => {
            when(mockRequest.user).thenReturn({ authLevel: AuthLevels.Volunteer });

            when(mockResponse.locals).thenReturn({});
            const mockResponseInstance: Response = instance(mockResponse);

            checkIsVolunteer(instance(mockRequest), instance(mockResponse), mockNext);

            expect(mockResponseInstance.locals.isVolunteer).toBeTruthy();
            expect(mockResponseInstance.locals.isOrganizer).toBeUndefined();

            expect(nextCalled).toBeTruthy();
        });

        test("Should ensure that an organizer user is given volunteer and organizer permissions", (): void => {
            when(mockRequest.user).thenReturn({ authLevel: AuthLevels.Organizer });

            when(mockResponse.locals).thenReturn({});
            const mockResponseInstance: Response = instance(mockResponse);

            checkIsVolunteer(instance(mockRequest), instance(mockResponse), mockNext);

            expect(mockResponseInstance.locals.isVolunteer).toBeTruthy();
            expect(mockResponseInstance.locals.isOrganizer).toBeTruthy();

            expect(nextCalled).toBeTruthy();
        });
    });

    describe("Test checkIsOrganizer", (): void => {
        test("Should ensure that a user who is not logged in gets redirected to /login", (): void => {
            const mockRedirectURL: string = "testURL";
            when(mockRequest.session).thenReturn(new MockSession())
            when(mockRequest.originalUrl).thenReturn(mockRedirectURL);
            const mockRequestInstance: Request = instance(mockRequest);

            checkIsOrganizer(mockRequestInstance, instance(mockResponse), mockNext);

            verify(mockRequest.originalUrl).once();
            expect(mockRequestInstance.session.redirectTo).toEqual(mockRedirectURL);
            expect(nextCalled).toBeFalsy();
            verify(mockResponse.redirect("/login")).once();
        });

        test("Should ensure that an attendee user gets redirected to /login", (): void => {
            const mockRedirectURL: string = "testURL";
            when(mockRequest.session).thenReturn(new MockSession())
            when(mockRequest.originalUrl).thenReturn(mockRedirectURL);
            when(mockRequest.user).thenReturn({ authLevel: AuthLevels.Attendee });
            const mockRequestInstance: Request = instance(mockRequest);

            checkIsOrganizer(mockRequestInstance, instance(mockResponse), mockNext);

            verify(mockRequest.originalUrl).once();
            expect(mockRequestInstance.session.redirectTo).toEqual(mockRedirectURL);
            expect(nextCalled).toBeFalsy();
            verify(mockResponse.redirect("/login")).once();
        });

        test("Should ensure that a volunteer user gets redirected to /login", (): void => {
            const mockRedirectURL: string = "testURL";
            when(mockRequest.session).thenReturn(new MockSession())
            when(mockRequest.originalUrl).thenReturn(mockRedirectURL);
            when(mockRequest.user).thenReturn({ authLevel: AuthLevels.Volunteer });
            const mockRequestInstance: Request = instance(mockRequest);

            checkIsOrganizer(mockRequestInstance, instance(mockResponse), mockNext);

            verify(mockRequest.originalUrl).once();
            expect(mockRequestInstance.session.redirectTo).toEqual(mockRedirectURL);
            expect(nextCalled).toBeFalsy();
            verify(mockResponse.redirect("/login")).once();
        });

        test("Should ensure that an organizer user gets given volunteer and organizer permissions", (): void => {
            when(mockRequest.user).thenReturn({ authLevel: AuthLevels.Organizer });

            when(mockResponse.locals).thenReturn({});
            const mockResponseInstance: Response = instance(mockResponse);

            checkIsOrganizer(instance(mockRequest), instance(mockResponse), mockNext);

            expect(mockResponseInstance.locals.isVolunteer).toBeTruthy();
            expect(mockResponseInstance.locals.isOrganizer).toBeTruthy();

            expect(nextCalled).toBeTruthy();
        });
    });
});