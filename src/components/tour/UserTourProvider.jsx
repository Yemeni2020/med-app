import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '@/components/tour/user-tour.css';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { getTourRole, getTourRoleLabel, getTourStepsForRole, hasStepsForPath, TOUR_COPY } from '@/tours/tourSteps';
import { isTourCompleted, markTourCompleted, resetTourCompletion } from '@/tours/tourStorage';

const AUTO_START_DELAY_MS = 900;
const TARGET_WAIT_MS = 3500;
const TARGET_RETRY_MS = 150;

export const UserTourContext = createContext(null);

function normalizePath(pathname) {
  if (!pathname) return '/';
  if (/^\/articles\/[^/]+$/i.test(pathname)) return '/articles/1';
  if (/^\/doctors\/[^/]+$/i.test(pathname)) return '/doctors';
  if (/^\/stories\/[^/]+$/i.test(pathname)) return '/stories/1';
  return pathname;
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function waitForElement(selector) {
  const started = Date.now();

  while (Date.now() - started < TARGET_WAIT_MS) {
    const element = document.querySelector(selector);
    if (element) return element;
    await delay(TARGET_RETRY_MS);
  }

  return null;
}

export function UserTourProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authChecked, isLoadingAuth } = useAuth();
  const { lang, isRTL } = useLanguage();
  const currentRole = useMemo(() => getTourRole(user), [user]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isAutoStartEnabled, setIsAutoStartEnabled] = useState(true);
  const sessionRef = useRef(null);
  const driverRef = useRef(null);
  const destroyingRef = useRef(false);
  const autoStartTimerRef = useRef(null);
  const startedRolesRef = useRef(new Set());

  const pathname = normalizePath(location.pathname);

  const destroyDriver = useCallback(() => {
    if (!driverRef.current) return;
    destroyingRef.current = true;
    driverRef.current.destroy();
    driverRef.current = null;
    window.setTimeout(() => {
      destroyingRef.current = false;
    }, 0);
  }, []);

  const completeTour = useCallback((role) => {
    if (role) {
      markTourCompleted(role);
      startedRolesRef.current.add(role);
    }

    destroyDriver();
    sessionRef.current = null;
    setActiveIndex(-1);
    setActiveRole(null);
    setIsRunning(false);
  }, [destroyDriver]);

  const skipTour = useCallback(() => {
    const role = sessionRef.current?.role || activeRole || currentRole;
    completeTour(role);
  }, [activeRole, completeTour, currentRole]);

  const goToStep = useCallback(async (nextIndex) => {
    const session = sessionRef.current;
    if (!session) return;

    const { role, steps } = session;

    if (nextIndex < 0) {
      return;
    }

    if (nextIndex >= steps.length) {
      completeTour(role);
      return;
    }

    const stepDefinition = steps[nextIndex];
    setIsRunning(true);
    setActiveRole(role);
    setActiveIndex(nextIndex);

    if (normalizePath(stepDefinition.route) !== pathname) {
      navigate(stepDefinition.route);
      return;
    }

    const target = await waitForElement(stepDefinition.element);
    if (!sessionRef.current || sessionRef.current.role !== role) {
      return;
    }

    if (!target) {
      await goToStep(nextIndex + 1);
      return;
    }

    destroyDriver();

    const total = steps.length;
    const isLast = nextIndex === total - 1;
    const buttons = TOUR_COPY.buttons[lang] || TOUR_COPY.buttons.en;
    const progressLabel = TOUR_COPY.labels[lang]?.progress(nextIndex + 1, total) || TOUR_COPY.labels.en.progress(nextIndex + 1, total);

    driverRef.current = driver({
      animate: true,
      allowClose: true,
      allowKeyboardControl: true,
      smoothScroll: true,
      showButtons: ['previous', 'next', 'close'],
      overlayOpacity: 0.58,
      stagePadding: 8,
      stageRadius: 16,
      popoverClass: `med-tour-popover ${isRTL ? 'med-tour-popover-rtl' : ''}`,
      steps: [
        {
          element: stepDefinition.element,
          popover: {
            title: stepDefinition.title[lang] || stepDefinition.title.en,
            description: stepDefinition.description[lang] || stepDefinition.description.en,
            side: stepDefinition.side,
            align: isRTL ? 'end' : stepDefinition.align,
            nextBtnText: isLast ? buttons.done : buttons.next,
            prevBtnText: buttons.previous,
            onNextClick: () => {
              goToStep(nextIndex + 1);
            },
            onPrevClick: () => {
              goToStep(nextIndex - 1);
            },
            onCloseClick: () => {
              skipTour();
            },
            onPopoverRender: (popover) => {
              if (popover.progress) {
                popover.progress.textContent = progressLabel;
              }

              popover.previousButton.disabled = nextIndex === 0;
              popover.previousButton.setAttribute('aria-label', buttons.previous);
              popover.nextButton.setAttribute('aria-label', isLast ? buttons.done : buttons.next);

              if (!popover.footer.querySelector('.med-tour-skip-btn')) {
                const skipButton = document.createElement('button');
                skipButton.type = 'button';
                skipButton.className = 'med-tour-skip-btn';
                skipButton.textContent = buttons.skip;
                skipButton.addEventListener('click', () => skipTour());
                popover.footer.insertBefore(skipButton, popover.footerButtons);
              }
            },
          },
        },
      ],
      onDestroyed: () => {
        if (!destroyingRef.current && sessionRef.current?.role === role) {
          setIsRunning(false);
        }
      },
    });

    driverRef.current.drive();
  }, [completeTour, destroyDriver, isRTL, lang, navigate, pathname, skipTour]);

  const startTour = useCallback((role = currentRole, options = {}) => {
    const steps = getTourStepsForRole(role);
    const force = options.force === true;

    if (!force && isTourCompleted(role)) {
      return;
    }

    if (!force) {
      startedRolesRef.current.add(role);
    }

    sessionRef.current = { role, steps, manual: force };
    setIsAutoStartEnabled(false);
    if (force) {
      resetTourCompletion(role);
    }

    const startIndex = steps.findIndex((stepDefinition) => normalizePath(stepDefinition.route) === pathname);
    void goToStep(startIndex >= 0 ? startIndex : 0);
  }, [currentRole, goToStep, pathname]);

  useEffect(() => {
    if (sessionRef.current && activeIndex >= 0) {
      const activeStep = sessionRef.current.steps[activeIndex];
      if (activeStep && normalizePath(activeStep.route) === pathname && !driverRef.current) {
        void goToStep(activeIndex);
      }
    }
  }, [activeIndex, goToStep, pathname]);

  useEffect(() => {
    if (autoStartTimerRef.current) {
      window.clearTimeout(autoStartTimerRef.current);
    }

    if (!authChecked || isLoadingAuth || isRunning || !isAutoStartEnabled) {
      return undefined;
    }

    if (isTourCompleted(currentRole) || startedRolesRef.current.has(currentRole)) {
      return undefined;
    }

    if (!hasStepsForPath(currentRole, pathname)) {
      return undefined;
    }

    autoStartTimerRef.current = window.setTimeout(() => {
      startTour(currentRole);
    }, AUTO_START_DELAY_MS);

    return () => {
      if (autoStartTimerRef.current) {
        window.clearTimeout(autoStartTimerRef.current);
      }
    };
  }, [authChecked, currentRole, isAutoStartEnabled, isLoadingAuth, isRunning, pathname, startTour]);

  useEffect(() => () => destroyDriver(), [destroyDriver]);

  const value = useMemo(() => ({
    currentRole,
    currentRoleLabel: getTourRoleLabel(currentRole, lang),
    isRunning,
    activeRole,
    activeIndex,
    startTour,
    skipTour,
    resetCurrentTour: () => {
      resetTourCompletion(currentRole);
      startedRolesRef.current.delete(currentRole);
    },
  }), [activeIndex, activeRole, currentRole, isRunning, lang, skipTour, startTour]);

  return (
    <UserTourContext.Provider value={value}>
      {children}
    </UserTourContext.Provider>
  );
}
