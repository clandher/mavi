import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { Category, Activity } from '@app/core/dto';
import { ImageHttpClient } from '@app/core/image-http-client';
import { ToastrService } from 'ngx-toastr';
import { ActivityComponent } from '../activity/activity.component';
import { FormsModule } from '@angular/forms';
import { RequestQueryBuilder } from '@dataui/crud-request';

@Component({
	selector: 'app-activity-selector',
	templateUrl: './activity-selector.component.html',
	styleUrls: ['./activity-selector.component.scss'],
	standalone: true,
	imports: [CommonModule, FormsModule, ActivityComponent]
})
export class ActivitySelectorComponent {
	@Output() select = new EventEmitter<Activity | null>();
	@Output() debt = new EventEmitter<boolean>();


	selectedCategory: Category | null = null;
	selectedActivity: Activity | null = null;


	showActivitieByCategoryPast: boolean = false;
	selectedActivityIsPast: boolean = false;

	public categories: Category[] = [];

	public activitiesByCategoryCurrent: Activity[] = [];
	public activitiesByCategoryPast: Activity[] = [];
	public activities: Activity[] = [];

	public showActivityModal: boolean = false;
	public activityId: number | null = null;

	public loadingActivities: boolean = false;


	public showDebt = true;
	private _isSimulatedEvent = false;

	private _procureValue(key: 'category' | 'activity'): number | null {
		let value = this.route.snapshot.queryParams[key];
		if (value) {
			return Number(value);
		}

		value = localStorage.getItem('activity-selector.' + key);
		if (value) {
			return Number(value);
		}

		return null;
	}

	constructor(
		public router: Router,
		private route: ActivatedRoute,
		private http: HttpClient,
		private imageHttp: ImageHttpClient,
		private toastr: ToastrService,
	) {

		Promise.all([
			new BaseHttp(`categories`, this.http).get<Category[]>().toPromise(),
		]).then(([categories]) => {
			this.categories = categories || [];

			if (this.categories.length) {
				const categoryFound = this.categories.find(c => c.id === this._procureValue('category'));
				if (categoryFound) {
					this.selectedCategory = categoryFound;
				} else {
					this.selectedCategory = this.categories[0];
				}
			}

			this.onCategoryChange();
		});
	}

	previousCategory(): void {
		const idx = this.categories.findIndex(c => c.id === this.selectedCategory?.id);
		if (idx > 0) {
			this.selectedCategory = this.categories[idx - 1];
		} else if (idx === 0) {
			this.selectedCategory = this.categories[this.categories.length - 1];
		}
		this.onCategoryChange();
	}

	nextCategory(): void {
		const idx = this.categories.findIndex(c => c.id === this.selectedCategory?.id);
		if (idx < this.categories.length - 1 && idx !== -1) {
			this.selectedCategory = this.categories[idx + 1];
		} else if (idx === this.categories.length - 1) {
			this.selectedCategory = this.categories[0];
		}
		this.onCategoryChange();
	}


	async onActivityComplete(value: boolean): Promise<void> {
		this.showActivityModal = false;
		if (value) {
			await this._fetchActivities();
		}
	}

	onNewActivity(): void {
		this.activityId = 0;
		this.showActivityModal = true;
	}

	onEditActivity(): void {
		if (this.selectedActivity) {
			this.activityId = this.selectedActivity.id;
			this.showActivityModal = true;
		}
	}

	async onCategoryChange() {

		if (!this.selectedCategory) {
			this.onActivityChange(null);
			return;
		};

		await this._fetchActivities();

		if (this.activities.length === 0) {
			this.onActivityChange(null);
			return;
		}

		const activityFound = this.activities.find(c => c.id === this._procureValue('activity'));
		if (activityFound) {
			this.selectedActivityIsPast = activityFound ? new Date(activityFound.endDate) < new Date() : false;
			this.onActivityChange(activityFound);
		} else {
			if (this.activitiesByCategoryCurrent.length) {
				this.onActivityChange(this.activitiesByCategoryCurrent[0]);
			} else {
				this.selectedActivityIsPast = new Date(this.activities[0].endDate) < new Date();
				this.onActivityChange(this.activities[0]);
			}
		}

		setTimeout(() => {
			const selectedTab = document.querySelector('.mavi-tab.selected') as HTMLElement;
			if (selectedTab) {
				this._isSimulatedEvent = true;
				const event = new MouseEvent('click', { bubbles: true });
				selectedTab.dispatchEvent(event);
				this._isSimulatedEvent = false;
			}
		}, 100);
	}


	onActivityChange(activity: Activity | null): void {
		if (this._isSimulatedEvent) {
			return;
		}

		this.selectedActivity = activity;
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { category: this.selectedCategory?.id, activity: this.selectedActivity?.id },
			queryParamsHandling: 'merge'
		});

		localStorage.setItem('activity-selector.category', this.selectedCategory?.id?.toString() || '');
		localStorage.setItem('activity-selector.activity', this.selectedActivity?.id?.toString() || '');

		this.select.emit(activity);
		this.selectedActivityIsPast = activity ? new Date(activity.endDate) < new Date() : false;
	}

	onShowDebt() {
		this.showDebt = !this.showDebt;
		this.debt.emit(this.showDebt);
	}

	private async _fetchActivities() {
		if (!this.selectedCategory) {
			this.activities = [];
			return;
		}

		const queryString = RequestQueryBuilder.create({
			search: { categoryId: Number(this.selectedCategory.id) },
		}).query();

		this.loadingActivities = true;
		this.activities = (await this.http.get<Activity[]>(buildUrl(`activities?${queryString}`)).toPromise()) || [];
		this.loadingActivities = false;
		this.activitiesByCategoryCurrent = this.activities.filter(a => new Date(a.endDate) >= new Date());
		this.activitiesByCategoryPast = this.activities.filter(a => new Date(a.endDate) < new Date());
	}

	private isDragging = false;
	private startX = 0;
	private scrollLeft = 0;

	onMouseDown(event: MouseEvent): void {
		const tabs = event.target as HTMLElement;
		if (!tabs.classList.contains('mavi-tabs')) return;

		this.isDragging = true;
		this.startX = event.pageX - tabs.offsetLeft;
		this.scrollLeft = tabs.scrollLeft;
		tabs.classList.add('dragging');
	}

	onMouseMove(event: MouseEvent): void {
		if (!this.isDragging) return;

		const tabs = document.querySelector('.mavi-tabs') as HTMLElement;
		if (!tabs) return;

		const x = event.pageX - tabs.offsetLeft;
		const walk = (x - this.startX) * 2; // Scroll speed multiplier
		tabs.scrollLeft = this.scrollLeft - walk;
	}

	onMouseUp(): void {
		this.isDragging = false;
		const tabs = document.querySelector('.mavi-tabs');
		tabs?.classList.remove('dragging');
	}

	centerTab(event: MouseEvent): void {
		const tab = event.target as HTMLElement;
		const tabsContainer = tab.closest('.mavi-tabs') as HTMLElement;
		if (!tabsContainer) return;

		const tabRect = tab.getBoundingClientRect();
		const containerRect = tabsContainer.getBoundingClientRect();

		const offset = tabRect.left - containerRect.left - (containerRect.width / 2) + (tabRect.width / 2);
		tabsContainer.scrollBy({ left: offset, behavior: 'smooth' });
	}

}