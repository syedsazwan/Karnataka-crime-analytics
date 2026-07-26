import { useState, useEffect } from 'react';
import {
  loadFirDataset,
  loadPoliceStations,
  loadDistrictGeoJSON,
  loadDistrictCrimeMaster,
  loadMonthlyCrimeReview,
  loadDemographicsCensus,
  loadNcrbIpcMaster,
  computeDashboardMetrics,
  computeMonthlyTrend,
  computeCrimeCategories,
  computeTopDistricts
} from '../services/csvDataLoader';
import { useSettings } from '../contexts/SettingsContext';

export const useCrimeData = (selectedDistrict = 'All', selectedYear = 'All') => {
  const { aiThresholds } = useSettings();
  
  const [firs, setFirs] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);
  const [geoJSON, setGeoJSON] = useState(null);
  const [districtMaster, setDistrictMaster] = useState([]);
  const [monthlyReview, setMonthlyReview] = useState([]);
  const [demographics, setDemographics] = useState([]);
  const [ncrbMaster, setNcrbMaster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          firData,
          stationData,
          geoData,
          distMasterData,
          monthlyData,
          demoData,
          ncrbData
        ] = await Promise.all([
          loadFirDataset(),
          loadPoliceStations(),
          loadDistrictGeoJSON(),
          loadDistrictCrimeMaster(),
          loadMonthlyCrimeReview(),
          loadDemographicsCensus(),
          loadNcrbIpcMaster()
        ]);

        if (isMounted) {
          setFirs(firData);
          setPoliceStations(stationData);
          setGeoJSON(geoData);
          setDistrictMaster(distMasterData);
          setMonthlyReview(monthlyData);
          setDemographics(demoData);
          setNcrbMaster(ncrbData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = computeDashboardMetrics(firs, selectedDistrict, selectedYear, aiThresholds);
  const monthlyTrend = computeMonthlyTrend(firs);
  const crimeCategories = computeCrimeCategories(firs);
  const topDistricts = computeTopDistricts(firs, aiThresholds);

  return {
    firs,
    policeStations,
    geoJSON,
    districtMaster,
    monthlyReview,
    demographics,
    ncrbMaster,
    metrics,
    monthlyTrend,
    crimeCategories,
    topDistricts,
    loading,
    error
  };
};

