package org.healthrenewal.rawafid;

import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;

/** Optional Quick Settings SOS tile. */
public final class EmergencyTileService extends TileService {
    @Override public void onStartListening(){
        super.onStartListening();
        Tile tile=getQsTile();
        if(tile!=null){
            boolean ready=new SecurePrefs(this).hasEmergencyPlan();
            tile.setState(ready?Tile.STATE_INACTIVE:Tile.STATE_UNAVAILABLE);
            tile.setLabel(getString(R.string.safety_tile_label));
            tile.updateTile();
        }
    }

    @Override public void onClick(){
        super.onClick();
        if(!new SecurePrefs(this).hasEmergencyPlan()) return;
        EmergencyActionDispatcher.dispatch(this,"quick_settings_tile");
    }
}