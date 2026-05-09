class LocationExtension {
  constructor() {
    this.locationData = {
      latitude: 'unknown',
      longitude: 'unknown',
      accuracy: 'unknown',
      country: 'unknown',
      state: 'unknown',
      town: 'unknown',
      houseNumber: 'unknown',
      road: 'unknown',
      address: 'unknown',
      ip: 'unknown'
    };

    this.updateLocation();
  }

  getInfo() {
    return {
      id: 'locationext',
      name: 'Location',
      blocks: [
        {
          opcode: 'getLocation',
          blockType: Scratch.BlockType.REPORTER,
          text: 'location [LOCATION]',
          arguments: {
            LOCATION: {
              type: Scratch.ArgumentType.STRING,
              menu: 'locationMenu',
              defaultValue: 'latitude'
            }
          }
        },

        {
          opcode: 'isLocationAvailable',
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'is location available?'
        },

        {
          opcode: 'refreshLocation',
          blockType: Scratch.BlockType.COMMAND,
          text: 'refresh location'
        }
      ],

      menus: {
        locationMenu: {
          acceptReporters: false,
          items: [
            'latitude',
            'longitude',
            'accuracy',
            'country',
            'state',
            'town',
            'house number',
            'street',
            'address',
            'ip address'
          ]
        }
      }
    };
  }

  async updateLocation() {
    // Reset values while loading
    this.locationData.latitude = 'unknown';
    this.locationData.longitude = 'unknown';

    // Get IP address
    try {
      const ipRes = await fetch(
        'https://api.ipify.org?format=json'
      );

      const ipData = await ipRes.json();

      this.locationData.ip =
        ipData.ip || 'unknown';

    } catch (e) {
      console.error('IP fetch failed:', e);
    }

    // Check for geolocation support
    if (!navigator.geolocation) {
      console.error('Geolocation not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(

      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        this.locationData.latitude =
          lat.toString();

        this.locationData.longitude =
          lon.toString();

        this.locationData.accuracy =
          position.coords.accuracy.toString();

        // Reverse geocoding
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
          );

          const data = await res.json();

          const addr = data.address || {};

          this.locationData.country =
            addr.country || 'unknown';

          this.locationData.state =
            addr.state || 'unknown';

          this.locationData.town =
            addr.city ||
            addr.town ||
            addr.village ||
            'unknown';

          this.locationData.houseNumber =
            addr.house_number || 'unknown';

          this.locationData.road =
            addr.road || 'unknown';

          this.locationData.address =
            data.display_name || 'unknown';

        } catch (e) {
          console.error(
            'Reverse geocoding failed:',
            e
          );
        }
      },

      (error) => {
        console.error(
          'Location error:',
          error
        );
      }
    );
  }

  refreshLocation() {
    this.updateLocation();
  }

  isLocationAvailable() {
    return (
      this.locationData.latitude !== 'unknown' &&
      this.locationData.longitude !== 'unknown'
    );
  }

  getLocation(args) {
    switch (args.LOCATION) {

      case 'latitude':
        return this.locationData.latitude;

      case 'longitude':
        return this.locationData.longitude;

      case 'accuracy':
        return (
          this.locationData.accuracy +
          ' meters'
        );

      case 'country':
        return this.locationData.country;

      case 'state':
        return this.locationData.state;

      case 'town':
        return this.locationData.town;

      case 'house number':
        return this.locationData.houseNumber;

      case 'street':
        return this.locationData.road;

      case 'address':
        return this.locationData.address;

      case 'ip address':
        return this.locationData.ip;

      default:
        return '';
    }
  }
}

Scratch.extensions.register(
  new LocationExtension()
);
